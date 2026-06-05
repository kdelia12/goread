import { NextResponse } from "next/server";
import { bookIdSchema, parseInput } from "@/lib/security/validation";
import { epubUrl } from "@/lib/gutenberg-mirror";
import { assertSafeUrl } from "@/lib/security/url-guard";
import { RateLimiter } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/security/request";

export const runtime = "nodejs";

const limiter = new RateLimiter(40, 60_000);

/** Follow redirects manually, re-validating each hop against the SSRF allow-list. */
async function fetchValidatedRedirects(startUrl: string, maxHops = 4): Promise<Response> {
  let current = startUrl;
  for (let hop = 0; hop < maxHops; hop++) {
    const res = await fetch(current, {
      redirect: "manual",
      headers: { "User-Agent": "goread/1.0 (reader; +https://www.gutenberg.org)" },
      signal: AbortSignal.timeout(20_000),
    });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new Error("redirect without location");
      const next = new URL(location, current).toString();
      assertSafeUrl(next); // throws if redirected off the allow-list
      current = next;
      continue;
    }
    return res;
  }
  throw new Error("too many redirects");
}

/**
 * EPUB proxy. The browser can't fetch gutenberg.org (no CORS), so we stream the
 * bytes server-side. The target URL is built from a validated integer id via
 * the canonical cache path — never from user-supplied input — and then re-checked
 * by the SSRF guard before any fetch happens.
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const parsed = parseInput(bookIdSchema, id);
  if (!parsed.ok) return new NextResponse("Invalid book id", { status: 400 });

  if (!limiter.check(clientIp(req), Date.now()).allowed) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  let safe: URL;
  try {
    safe = assertSafeUrl(epubUrl(parsed.data));
  } catch {
    return new NextResponse("Blocked", { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetchValidatedRedirects(safe.toString());
  } catch {
    return new NextResponse("Upstream fetch failed", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Upstream error", { status: 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "application/epub+zip",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="pg${parsed.data}.epub"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

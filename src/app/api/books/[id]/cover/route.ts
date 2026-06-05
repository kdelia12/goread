import { NextResponse } from "next/server";
import { bookIdSchema, parseInput } from "@/lib/security/validation";
import { coverUrl } from "@/lib/gutenberg-mirror";
import { assertSafeUrl } from "@/lib/security/url-guard";
import { RateLimiter } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/security/request";

export const runtime = "nodejs";

const limiter = new RateLimiter(120, 60_000);

/**
 * Same-origin cover proxy. Lets the share-image canvas draw the real cover
 * without tainting (same-origin images don't taint), and shields gutenberg.org
 * from direct hotlinking. SSRF-guarded like the EPUB proxy.
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
    safe = assertSafeUrl(coverUrl(parsed.data));
  } catch {
    return new NextResponse("Blocked", { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(safe.toString(), {
      redirect: "follow",
      headers: { "User-Agent": "goread/1.0 (reader; +https://www.gutenberg.org)" },
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return new NextResponse("Upstream fetch failed", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) return new NextResponse("No cover", { status: 404 });

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

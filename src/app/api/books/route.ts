import { NextResponse } from "next/server";
import { searchBooks } from "@/lib/gutendex";
import { booksQuerySchema, parseInput } from "@/lib/security/validation";
import { RateLimiter } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/security/request";

export const runtime = "nodejs";

const limiter = new RateLimiter(90, 60_000);

export async function GET(req: Request) {
  if (!limiter.check(clientIp(req), Date.now()).allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const sp = new URL(req.url).searchParams;
  const parsed = parseInput(booksQuerySchema, {
    search: sp.get("search") ?? undefined,
    topic: sp.get("topic") ?? undefined,
    languages: sp.get("languages") ?? undefined,
    sort: sp.get("sort") ?? undefined,
    page: sp.get("page") ?? undefined,
  });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const list = await searchBooks(parsed.data);
  return NextResponse.json(list, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}

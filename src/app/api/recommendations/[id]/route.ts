import { NextResponse } from "next/server";
import { getBook, searchBooks, FIXTURE_CATALOGUE } from "@/lib/gutendex";
import { recommend } from "@/lib/recommend";
import { bookIdSchema, parseInput } from "@/lib/security/validation";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const parsed = parseInput(bookIdSchema, id);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const seed = await getBook(parsed.data);
  if (!seed) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  // Candidate pool: books sharing the seed's top shelf/subject, plus the bundled set.
  const topic = seed.bookshelves[0] ?? seed.subjects[0]?.split(" -- ")[0];
  let pool = FIXTURE_CATALOGUE;
  if (topic) {
    try {
      const found = (await searchBooks({ topic, sort: "popular" })).results;
      if (found.length > 0) pool = found;
    } catch {
      /* keep fixtures */
    }
  }

  const recs = recommend(seed, pool, { limit: 8 });
  return NextResponse.json(
    { recommendations: recs.map((r) => ({ book: r.book, reasons: r.reasons })) },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
  );
}

import { NextResponse } from "next/server";
import { getBook } from "@/lib/gutendex";
import { bookIdSchema, parseInput } from "@/lib/security/validation";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const parsed = parseInput(bookIdSchema, id);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const book = await getBook(parsed.data);
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  return NextResponse.json(book, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
  });
}

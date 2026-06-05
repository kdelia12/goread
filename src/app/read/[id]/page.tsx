import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook } from "@/lib/gutendex";
import { authorByline } from "@/lib/gutendex-normalize";
import { Reader } from "@/components/reader/reader";

function parseId(id: string): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const bookId = parseId(id);
  const book = bookId ? await getBook(bookId) : null;
  return { title: book ? `Reading ${book.title}` : "Reader" };
}

export default async function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bookId = parseId(id);
  if (!bookId) notFound();
  const book = await getBook(bookId);
  if (!book) notFound();

  return <Reader id={book.id} title={book.title} author={authorByline(book)} />;
}

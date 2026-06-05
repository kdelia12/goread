import { getBook, searchBooks, FIXTURE_CATALOGUE } from "@/lib/gutendex";
import { recommend } from "@/lib/recommend";
import { BookRail } from "./book-rail";

/** Server component: content-based "you might also like" for a book. */
export async function Recommendations({ bookId }: { bookId: number }) {
  const seed = await getBook(bookId);
  if (!seed) return null;

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

  const recs = recommend(seed, pool, { limit: 12 }).map((r) => r.book);
  if (recs.length === 0) return null;

  return <BookRail title="You might also like" eyebrow="Recommended" books={recs} />;
}

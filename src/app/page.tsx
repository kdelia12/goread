import { searchBooks } from "@/lib/gutendex";
import { BookRail } from "@/components/book-rail";
import { SearchBar } from "@/components/search-bar";
import { HeroBook } from "@/components/hero-book";
import { ContinueReading } from "@/components/continue-reading";

export const revalidate = 3600;

export default async function HomePage() {
  const [trending, gothic, adventure, philosophy, childrens] = await Promise.all([
    searchBooks({ sort: "popular" }),
    searchBooks({ topic: "gothic" }),
    searchBooks({ topic: "adventure" }),
    searchBooks({ topic: "philosophy" }),
    searchBooks({ topic: "children" }),
  ]);

  const featured = trending.results[0];
  const trendingRail = trending.results.slice(1);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="border-b border-border py-10 sm:py-14">
        {featured ? <HeroBook book={featured} /> : null}
        <div className="mx-auto mt-10 max-w-2xl">
          <SearchBar />
        </div>
      </section>

      <div className="space-y-12 py-12">
        <ContinueReading />
        <BookRail title="Trending now" eyebrow="Most read" books={trendingRail} href="/search?sort=popular" />
        <BookRail title="Gothic & the uncanny" eyebrow="By mood" books={gothic.results} href="/search?topic=gothic" />
        <BookRail title="Grand adventures" eyebrow="By mood" books={adventure.results} href="/search?topic=adventure" />
        <BookRail title="Philosophy & ideas" eyebrow="By subject" books={philosophy.results} href="/search?topic=philosophy" />
        <BookRail title="For younger readers" eyebrow="By subject" books={childrens.results} href="/search?topic=children" />
      </div>
    </div>
  );
}

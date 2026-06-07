import { FIXTURE_CATALOGUE } from "@/lib/gutendex";
import { queryBooks } from "@/lib/book-query";
import { BookRail } from "@/components/book-rail";
import { SearchBar } from "@/components/search-bar";
import { HeroBook } from "@/components/hero-book";
import { ContinueReading } from "@/components/continue-reading";

// Home uses the curated set for snappy, build-safe rails; "See all" and search
// query the full ~75k catalogue.
export default function HomePage() {
  const trending = queryBooks(FIXTURE_CATALOGUE, { sort: "popular" });
  const gothic = queryBooks(FIXTURE_CATALOGUE, { topic: "gothic" });
  const adventure = queryBooks(FIXTURE_CATALOGUE, { topic: "adventure" });
  const philosophy = queryBooks(FIXTURE_CATALOGUE, { topic: "philosophy" });
  const childrens = queryBooks(FIXTURE_CATALOGUE, { topic: "children" });

  const featured = trending.results[0];
  const trendingRail = trending.results.slice(1);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <h1 className="sr-only">
        goread — read every classic, free. 70,000 Project Gutenberg public-domain classics,
        beautiful on any device, no sign-up, at goread.fun.
      </h1>
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

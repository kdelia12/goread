import { searchBooks } from "@/lib/gutendex";
import { BookGrid } from "@/components/book-grid";
import { SearchBar } from "@/components/search-bar";
import { GenreChips } from "@/components/genre-chips";
import { EmptyState } from "@/components/empty-state";
import { genreLabel } from "@/lib/genres";
import { SearchX } from "lucide-react";

export const dynamic = "force-dynamic";

type SP = { q?: string; topic?: string; sort?: string; page?: string };

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const topic = sp.topic?.trim() || undefined;
  const sort =
    sp.sort === "ascending" || sp.sort === "descending" || sp.sort === "popular"
      ? sp.sort
      : undefined;
  const page = sp.page ? Math.max(1, Number.parseInt(sp.page, 10) || 1) : 1;

  const list = await searchBooks({ search: q, topic, sort, page });
  const heading = q
    ? `Results for “${q}”`
    : topic
      ? `${genreLabel(topic) ?? topic}`
      : "Browse the library";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <SearchBar defaultValue={q ?? ""} autoFocus={!q && !topic} />
      </div>

      <div className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Browse by genre
        </h2>
        <div className="mt-3">
          <GenreChips active={topic} />
        </div>
      </div>

      <div className="mt-8 flex items-baseline justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-fg">{heading}</h1>
        <p className="shrink-0 text-sm text-muted-fg">
          {list.count.toLocaleString()} {list.count === 1 ? "book" : "books"}
        </p>
      </div>

      <div className="mt-6">
        {list.results.length > 0 ? (
          <BookGrid books={list.results} />
        ) : (
          <EmptyState
            icon={<SearchX />}
            title="No books found"
            description="Try a different title, author, or subject."
          />
        )}
      </div>
    </div>
  );
}

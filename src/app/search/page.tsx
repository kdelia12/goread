import type { Metadata } from "next";
import { searchBooks } from "@/lib/gutendex";
import { BookGrid } from "@/components/book-grid";
import { SearchBar } from "@/components/search-bar";
import { GenreChips } from "@/components/genre-chips";
import { EmptyState } from "@/components/empty-state";
import { genreLabel } from "@/lib/genres";
import { SearchX } from "lucide-react";

export const dynamic = "force-dynamic";

type SP = { q?: string; topic?: string; sort?: string; page?: string };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const topic = sp.topic?.trim() || undefined;
  const page = sp.page ? Math.max(1, Number.parseInt(sp.page, 10) || 1) : 1;

  // Free-text queries and deep pages are infinite — let crawlers follow links
  // through them but keep them out of the index.
  const noindex = Boolean(q) || page > 1;

  if (q) {
    return {
      title: `Search: ${q}`,
      description: `Free public-domain books matching “${q}” — read beautifully on goread.`,
      robots: { index: false, follow: true },
    };
  }
  if (topic) {
    const label = genreLabel(topic) ?? topic;
    return {
      title: `${label} — free classics`,
      description: `Browse free ${label.toLowerCase()} from Project Gutenberg, beautiful to read on any device.`,
      alternates: { canonical: `/search?topic=${encodeURIComponent(topic)}` },
      robots: noindex ? { index: false, follow: true } : undefined,
    };
  }
  return {
    title: "Browse the library",
    description: "Browse 70,000 free public-domain classics, beautiful to read on any device.",
    alternates: { canonical: "/search" },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

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

import Link from "next/link";
import { BookOpen, Info } from "lucide-react";
import { BookCover } from "./book-cover";
import { authorByline } from "@/lib/gutendex-normalize";
import { displayTitle } from "@/lib/format";
import type { Book } from "@/lib/types";

export function HeroBook({ book }: { book: Book }) {
  const byline = authorByline(book);
  const title = displayTitle(book.title);
  return (
    <div className="grid items-center gap-8 sm:grid-cols-[200px_1fr] md:grid-cols-[260px_1fr]">
      <Link
        href={`/book/${book.id}`}
        className="mx-auto w-40 max-w-[260px] sm:mx-0 sm:w-full"
      >
        <BookCover title={title} author={byline} coverUrl={book.coverUrl} className="shadow-lg" />
      </Link>
      <div className="text-center sm:text-left">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Featured today
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.04] text-fg md:text-6xl">
          {title}
        </h1>
        <p className="mt-2 font-reading text-lg text-muted-fg">{byline}</p>
        {book.summary ? (
          <p className="mx-auto mt-4 max-w-xl font-reading text-base leading-relaxed text-fg/90 line-clamp-4 sm:mx-0">
            {book.summary}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
          <Link
            href={`/read/${book.id}`}
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius)] bg-accent px-6 text-sm font-medium text-accent-fg transition-[filter] hover:brightness-105"
          >
            <BookOpen className="h-4 w-4" /> Start reading
          </Link>
          <Link
            href={`/book/${book.id}`}
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius)] border border-border-strong px-6 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
          >
            <Info className="h-4 w-4" /> Details
          </Link>
        </div>
      </div>
    </div>
  );
}

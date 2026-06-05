import Link from "next/link";
import { BookCover } from "./book-cover";
import { authorByline } from "@/lib/gutendex-normalize";
import { displayTitle } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Book } from "@/lib/types";

export function BookCard({ book, className }: { book: Book; className?: string }) {
  const byline = authorByline(book);
  const title = displayTitle(book.title);
  return (
    <Link
      href={`/book/${book.id}`}
      className={cn("group block rounded-[var(--radius)] focus-visible:outline-none", className)}
    >
      <div className="transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:-translate-y-1 motion-reduce:transform-none">
        <BookCover
          title={title}
          author={byline}
          coverUrl={book.coverUrl}
          className="shadow-sm transition-shadow group-hover:shadow-md"
        />
      </div>
      <h3 className="mt-2 line-clamp-2 font-display text-base font-semibold leading-snug text-fg group-hover:text-accent">
        {title}
      </h3>
      <p className="line-clamp-1 text-sm text-muted-fg">{byline}</p>
    </Link>
  );
}

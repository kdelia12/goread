import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BookCard } from "./book-card";
import type { Book } from "@/lib/types";

interface BookRailProps {
  title: string;
  books: Book[];
  href?: string;
  eyebrow?: string;
}

export function BookRail({ title, books, href, eyebrow }: BookRailProps) {
  if (books.length === 0) return null;
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="font-display text-2xl font-semibold leading-tight text-fg sm:text-3xl">
            {title}
          </h2>
        </div>
        {href ? (
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-1 text-sm text-muted-fg transition-colors hover:text-accent"
          >
            See all
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </Link>
        ) : null}
      </div>
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 [-ms-overflow-style:none] [scrollbar-width:none]">
        {books.map((book) => (
          <div key={book.id} className="w-32 shrink-0 snap-start sm:w-36 md:w-40">
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Quote as QuoteIcon, Trash2, LibraryBig } from "lucide-react";
import {
  getReadingDays,
  getRecentBooks,
  getProgress,
  getLibrary,
  getCachedBook,
  getQuotes,
  removeQuote,
  type BookStub,
} from "@/lib/local-store";
import { computeStreak, dayKey } from "@/lib/streak";
import { progressLabel } from "@/lib/reading-position";
import { BookCover } from "@/components/book-cover";
import { BookCard } from "@/components/book-card";
import { EmptyState } from "@/components/empty-state";
import { ShareButton } from "@/components/share/share-button";
import { coverPaletteFor } from "@/lib/cover";
import { streakCaption, quoteAttribution, quoteCaption, type Quote } from "@/lib/share/quotes";
import type { Book } from "@/lib/types";

interface ReadingItem {
  stub: BookStub;
  pct: number;
  label: string;
}

function stubToBook(stub: BookStub): Book {
  return {
    id: stub.id,
    title: stub.title,
    authors: stub.author && stub.author !== "Unknown author" ? [{ name: stub.author, birthYear: null, deathYear: null }] : [],
    subjects: [],
    bookshelves: [],
    languages: [],
    summary: null,
    downloadCount: 0,
    coverUrl: stub.coverUrl,
    formats: {},
    epubUrl: null,
    textUrl: null,
  };
}

export default function LibraryPage() {
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [reading, setReading] = useState<ReadingItem[]>([]);
  const [saved, setSaved] = useState<BookStub[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [mounted, setMounted] = useState(false);

  function refresh() {
    const today = dayKey(Date.now(), new Date().getTimezoneOffset());
    const s = computeStreak(getReadingDays(), today);
    setStreak({ current: s.current, longest: s.longest });
    setReading(
      getRecentBooks()
        .map((stub) => {
          const p = getProgress(stub.id);
          return { stub, pct: p?.percentage ?? 0, label: progressLabel(p) };
        })
        .filter((i) => i.pct > 0),
    );
    setSaved(getLibrary().map(getCachedBook).filter((b): b is BookStub => Boolean(b)));
    setQuotes(getQuotes());
  }

  useEffect(() => {
    setMounted(true);
    refresh();
  }, []);

  if (!mounted) {
    return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6" />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-semibold text-fg">Your library</h1>

      {/* streak card */}
      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-[var(--radius)] border border-border bg-surface p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
            <Flame className="h-7 w-7 text-accent" />
          </div>
          <div>
            <p className="font-display text-2xl font-semibold text-fg">
              {streak.current} day{streak.current === 1 ? "" : "s"}
            </p>
            <p className="text-sm text-muted-fg">
              Reading streak · longest {streak.longest} day{streak.longest === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        {streak.current > 0 ? (
          <ShareButton
            spec={{ kind: "streak", current: streak.current, longest: streak.longest, palette: coverPaletteFor("streak") }}
            caption={streakCaption(streak.current)}
            filename="goread-streak.png"
          >
            Share streak
          </ShareButton>
        ) : null}
      </div>

      {/* continue reading */}
      {reading.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-fg">Continue reading</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
            {reading.map(({ stub, pct, label }) => (
              <Link key={stub.id} href={`/read/${stub.id}`} className="group">
                <BookCover title={stub.title} author={stub.author} coverUrl={stub.coverUrl} className="shadow-sm" />
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(pct * 100)}%` }} />
                </div>
                <h3 className="mt-1.5 line-clamp-1 font-display text-sm font-semibold text-fg group-hover:text-accent">
                  {stub.title}
                </h3>
                <p className="text-xs text-muted-fg">{label}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* saved */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-fg">Saved</h2>
        {saved.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {saved.map((stub) => (
              <BookCard key={stub.id} book={stubToBook(stub)} />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-4"
            icon={<LibraryBig />}
            title="Nothing saved yet"
            description="Tap Save on any book to keep it here."
            action={
              <Link href="/search" className="text-sm text-accent underline">
                Browse books
              </Link>
            }
          />
        )}
      </section>

      {/* quotes */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-fg">Saved quotes</h2>
        {quotes.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {quotes.map((q) => (
              <li key={q.id} className="rounded-[var(--radius)] border border-border bg-surface p-5">
                <p className="font-reading text-lg leading-relaxed text-fg">“{q.text}”</p>
                <p className="mt-2 text-sm text-muted-fg">{quoteAttribution(q)}</p>
                <div className="mt-3 flex gap-2">
                  <ShareButton
                    size="sm"
                    spec={{
                      kind: "quote",
                      text: q.text,
                      attribution: quoteAttribution(q),
                      palette: coverPaletteFor(q.bookTitle),
                    }}
                    caption={quoteCaption(q)}
                    filename={`goread-quote-${q.bookId}.png`}
                  />
                  <button
                    onClick={() => {
                      removeQuote(q.id);
                      refresh();
                    }}
                    className="inline-flex h-8 items-center gap-1 rounded-[var(--radius)] px-2 text-sm text-muted-fg hover:bg-surface-2 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            className="mt-4"
            icon={<QuoteIcon />}
            title="No quotes yet"
            description="While reading, select a passage and tap the quote icon to save and share it."
          />
        )}
      </section>
    </div>
  );
}

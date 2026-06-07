import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, WifiOff, Palette, Bookmark, Quote, Sparkles } from "lucide-react";
import { FIXTURE_CATALOGUE } from "@/lib/gutendex";
import { queryBooks } from "@/lib/book-query";
import { BookGrid } from "@/components/book-grid";
import { GENRES } from "@/lib/genres";

export const metadata: Metadata = {
  title: "Read Project Gutenberg online, free",
  description:
    "goread is a free, beautiful reader for all 70,000 Project Gutenberg classics — read online with no downloads and no sign-up. Five themes, offline, on any device.",
  alternates: { canonical: "/gutenberg" },
  openGraph: {
    type: "website",
    title: "Read Project Gutenberg online, free — goread",
    description:
      "A free, beautiful reader for all 70,000 Project Gutenberg classics. No downloads, no sign-up.",
    url: "/gutenberg",
  },
};

const FEATURES = [
  { icon: Palette, title: "Five reading themes", body: "Daylight, paper, sepia, midnight and true e-ink — Gutenberg the way it should look." },
  { icon: BookOpen, title: "Nothing to download", body: "Open any of ~70,000 books and start reading instantly. No EPUB files, no conversions." },
  { icon: WifiOff, title: "Works offline", body: "Install goread to your home screen and keep reading on the train, on a plane, anywhere." },
  { icon: Bookmark, title: "Bookmarks & streaks", body: "Keep your place across devices and build a daily reading habit with reading streaks." },
  { icon: Quote, title: "Quote to a Story", body: "Found a line worth sharing? Turn any passage into a gorgeous Instagram-Story image." },
  { icon: Sparkles, title: "No sign-up, no ads", body: "Start reading as a guest. An optional free account only syncs your library across devices." },
];

export default function GutenbergPage() {
  const popular = queryBooks(FIXTURE_CATALOGUE, { sort: "popular" }).results.slice(0, 12);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* hero */}
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          The whole public domain, beautifully
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-fg sm:text-5xl">
          Read Project Gutenberg online, beautifully
        </h1>
        <p className="mt-5 font-reading text-lg leading-relaxed text-muted-fg">
          Project Gutenberg holds ~70,000 free public-domain classics — but the reading experience
          is plain text and a maze of downloads. <strong className="text-fg">goread</strong> is a
          free reader for the entire Gutenberg library: open any book and start reading instantly —
          no downloads, no sign-up, no ads. Five themes, editorial typography, bookmarks, and it
          installs to your phone to read offline.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/search"
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius)] bg-accent px-6 text-sm font-medium text-accent-fg transition-[filter] hover:brightness-105"
          >
            <BookOpen className="h-4 w-4" /> Browse the library
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-[var(--radius)] border border-border-strong px-6 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
          >
            Today’s featured book
          </Link>
        </div>
      </section>

      {/* popular classics */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-fg">Popular Project Gutenberg classics</h2>
        <p className="mt-1 text-sm text-muted-fg">The most-read titles, ready to open in your browser.</p>
        <div className="mt-6">
          <BookGrid books={popular} />
        </div>
      </section>

      {/* why */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-fg">Why read Gutenberg on goread</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-[var(--radius)] border border-border bg-surface p-5">
              <f.icon className="h-6 w-6 text-accent" />
              <h3 className="mt-3 font-display text-lg font-semibold text-fg">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-fg">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* genres */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-fg">Browse Gutenberg by genre</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <Link
              key={g.topic}
              href={`/search?topic=${encodeURIComponent(g.topic)}`}
              className="rounded-full border border-border px-4 py-1.5 text-sm text-fg transition-colors hover:border-accent hover:text-accent"
            >
              {g.label}
            </Link>
          ))}
        </div>
      </section>

      {/* closing */}
      <section className="mx-auto mt-16 max-w-2xl rounded-[var(--radius)] border border-border bg-surface-2 p-8 text-center">
        <h2 className="font-display text-2xl font-semibold text-fg">Every classic, free</h2>
        <p className="mt-2 font-reading text-muted-fg">
          70,000 timeless books from Project Gutenberg, finally beautiful to read. No catch.
        </p>
        <Link
          href="/search"
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-[var(--radius)] bg-accent px-6 text-sm font-medium text-accent-fg transition-[filter] hover:brightness-105"
        >
          <BookOpen className="h-4 w-4" /> Start reading free
        </Link>
      </section>
    </div>
  );
}

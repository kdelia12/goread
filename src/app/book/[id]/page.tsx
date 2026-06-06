import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getBook } from "@/lib/gutendex";
import { authorByline } from "@/lib/gutendex-normalize";
import { BookCover } from "@/components/book-cover";
import { BookActions } from "@/components/book-actions";
import { TrackVisit } from "@/components/track-visit";
import { Recommendations } from "@/components/recommendations";
import { BookJsonLd } from "@/components/json-ld";
import { displayTitle } from "@/lib/format";
import { compactNumber } from "@/lib/utils";

function parseId(id: string): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** A short, clean meta description even when the catalogue has no summary. */
function bookDescription(title: string, author: string, summary?: string | null): string {
  if (summary && summary.trim().length > 0) {
    const s = summary.replace(/\s+/g, " ").trim();
    return s.length > 200 ? `${s.slice(0, 199).trimEnd()}…` : s;
  }
  return `Read ${title} by ${author} free on goread — beautiful, distraction-free, on every device.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const bookId = parseId(id);
  const book = bookId ? await getBook(bookId) : null;
  if (!book) {
    return { title: "Book not found", robots: { index: false, follow: true } };
  }
  const title = displayTitle(book.title, 90);
  const author = authorByline(book);
  const description = bookDescription(title, author, book.summary);
  const canonical = `/book/${book.id}`;

  return {
    title: `${title} — ${author}`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "book",
      title: `${title} — ${author}`,
      description,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${author}`,
      description,
    },
  };
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bookId = parseId(id);
  if (!bookId) notFound();

  const book = await getBook(bookId);
  if (!book) notFound();
  const byline = authorByline(book);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <TrackVisit
        stub={{ id: book.id, title: book.title, author: byline, coverUrl: book.coverUrl }}
      />
      <BookJsonLd
        id={book.id}
        title={displayTitle(book.title, 120)}
        author={byline}
        description={book.summary}
        image={book.coverUrl}
        subjects={book.subjects}
        language={book.languages[0]}
      />

      <div className="grid gap-8 sm:grid-cols-[220px_1fr]">
        <div className="mx-auto w-44 sm:mx-0 sm:w-full">
          <BookCover
            title={book.title}
            author={byline}
            coverUrl={book.coverUrl}
            className="shadow-lg"
          />
        </div>

        <div>
          <h1 className="font-display text-3xl font-semibold leading-tight text-fg sm:text-4xl">
            {book.title}
          </h1>
          <p className="mt-1 font-reading text-lg text-muted-fg">{byline}</p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-fg">
            <span className="rounded-full bg-surface-2 px-2.5 py-1">
              {compactNumber(book.downloadCount)} downloads
            </span>
            {book.languages.map((l) => (
              <span key={l} className="rounded-full bg-surface-2 px-2.5 py-1 uppercase">
                {l}
              </span>
            ))}
          </div>

          <div className="mt-6">
            <BookActions id={book.id} title={book.title} author={byline} />
          </div>

          {book.summary ? (
            <p className="mt-6 max-w-2xl font-reading text-base leading-relaxed text-fg/90">
              {book.summary}
            </p>
          ) : null}

          {book.subjects.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-fg">
                Subjects
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {book.subjects.slice(0, 12).map((s) => (
                  <Link
                    key={s}
                    href={`/search?topic=${encodeURIComponent(s.split(" -- ")[0])}`}
                    className="rounded-full border border-border px-3 py-1 text-sm text-fg transition-colors hover:border-accent hover:text-accent"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-14">
        <Recommendations bookId={book.id} />
      </div>
    </div>
  );
}

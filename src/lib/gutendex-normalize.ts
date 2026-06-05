import type { Author, Book } from "./types";
import {
  coverUrl as mirrorCover,
  pickCoverUrl,
  pickEpubUrl,
  pickTextUrl,
} from "./gutenberg-mirror";
import { displayAuthorName } from "./format";

/** The loosely-typed raw shapes Gutendex returns. */
interface RawAuthor {
  name?: string;
  birth_year?: number | null;
  death_year?: number | null;
}

export interface RawGutendexBook {
  id?: number;
  title?: string;
  authors?: RawAuthor[];
  subjects?: string[];
  bookshelves?: string[];
  languages?: string[];
  summaries?: string[];
  download_count?: number;
  formats?: Record<string, string>;
}

export interface RawGutendexList {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: RawGutendexBook[];
}

export interface BookList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Book[];
}

function normalizeAuthor(raw: RawAuthor): Author {
  return {
    name: (raw?.name ?? "Unknown").trim() || "Unknown",
    birthYear: typeof raw?.birth_year === "number" ? raw.birth_year : null,
    deathYear: typeof raw?.death_year === "number" ? raw.death_year : null,
  };
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

/** Convert one raw Gutendex book into our canonical `Book`. Never throws. */
export function normalizeBook(raw: RawGutendexBook): Book {
  const id = typeof raw?.id === "number" ? raw.id : 0;
  const formats = raw?.formats ?? {};
  const summaries = asStringArray(raw?.summaries);

  return {
    id,
    title: (raw?.title ?? "Untitled").trim() || "Untitled",
    authors: Array.isArray(raw?.authors) ? raw.authors.map(normalizeAuthor) : [],
    subjects: asStringArray(raw?.subjects),
    bookshelves: asStringArray(raw?.bookshelves),
    languages: asStringArray(raw?.languages),
    summary: summaries.length > 0 ? summaries[0] : null,
    downloadCount:
      typeof raw?.download_count === "number" ? raw.download_count : 0,
    coverUrl: pickCoverUrl(formats) ?? (id > 0 ? mirrorCover(id) : null),
    formats,
    epubUrl: pickEpubUrl(formats),
    textUrl: pickTextUrl(formats),
  };
}

export function normalizeList(raw: RawGutendexList): BookList {
  return {
    count: typeof raw?.count === "number" ? raw.count : 0,
    next: raw?.next ?? null,
    previous: raw?.previous ?? null,
    results: Array.isArray(raw?.results) ? raw.results.map(normalizeBook) : [],
  };
}

/** Convenience: a one-line author byline like "Jane Austen". */
export function authorByline(book: Book): string {
  if (book.authors.length === 0) return "Unknown author";
  return book.authors.map((a) => displayAuthorName(a.name)).join(", ");
}

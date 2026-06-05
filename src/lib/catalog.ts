import type { Author, Book } from "./types";
import { coverUrl as mirrorCover } from "./gutenberg-mirror";
import { FIXTURE_BOOKS } from "./fixtures/books";

/**
 * Full Project Gutenberg catalogue (~75k books) loaded from gutenberg.org's own
 * `pg_catalog.csv` feed. This is reachable even when the gutendex.com API is
 * down, so it's our reliable metadata source. Parsed once, cached in memory.
 *
 * The feed has no download counts, so we borrow them from the curated fixture
 * set to keep "popular" sorting meaningful for the well-known classics.
 */

const FEED_URL = `${process.env.GUTENBERG_BASE_URL || "https://www.gutenberg.org"}/cache/epub/feeds/pg_catalog.csv`;

const FIXTURE_DOWNLOADS = new Map<number, number>(
  FIXTURE_BOOKS.map((b) => [b.id ?? 0, b.download_count ?? 0]),
);

/** Minimal RFC-4180 CSV parser (quoted fields, escaped quotes, CRLF). */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Parse the catalogue Authors field ("Lastname, First, 1800-1880; ...") into Authors. */
export function parseAuthors(field: string): Author[] {
  if (!field) return [];
  return field
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const m = entry.match(/^(.*?),\s*(-?\d{1,4})\??-(-?\d{0,4})\??$/);
      if (m) {
        return {
          name: m[1].trim(),
          birthYear: m[2] ? Number(m[2]) : null,
          deathYear: m[3] ? Number(m[3]) : null,
        };
      }
      return { name: entry, birthYear: null, deathYear: null };
    });
}

function splitMulti(value: string): string[] {
  return (value || "")
    .split(";")
    .map((s) => s.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

/** Turn parsed CSV rows into Book records (Text-type entries only). */
export function rowsToBooks(rows: string[][]): Book[] {
  if (rows.length < 2) return [];
  const header = rows[0];
  const col = (name: string) => header.indexOf(name);
  const iId = col("Text#");
  const iType = col("Type");
  const iTitle = col("Title");
  const iLang = col("Language");
  const iAuth = col("Authors");
  const iSubj = col("Subjects");
  const iShelf = col("Bookshelves");

  const books: Book[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length <= iTitle) continue;
    if (iType >= 0 && row[iType] && row[iType] !== "Text") continue;
    const id = Number.parseInt(row[iId], 10);
    if (!Number.isInteger(id) || id <= 0) continue;
    const title = (row[iTitle] || "Untitled").replace(/\s+/g, " ").trim() || "Untitled";
    books.push({
      id,
      title,
      authors: parseAuthors(row[iAuth] ?? ""),
      subjects: splitMulti(row[iSubj] ?? ""),
      bookshelves: splitMulti(row[iShelf] ?? ""),
      languages: splitMulti(row[iLang] ?? ""),
      summary: null,
      downloadCount: FIXTURE_DOWNLOADS.get(id) ?? 0,
      coverUrl: mirrorCover(id),
      formats: {},
      epubUrl: null,
      textUrl: null,
    });
  }
  return books;
}

let cache: Book[] | null = null;
let byId: Map<number, Book> | null = null;
let loading: Promise<Book[]> | null = null;

export async function loadCatalog(): Promise<Book[]> {
  if (cache) return cache;
  if (loading) return loading;
  loading = (async () => {
    const res = await fetch(FEED_URL, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`catalog ${res.status}`);
    const text = await res.text();
    const books = rowsToBooks(parseCSV(text));
    if (books.length === 0) throw new Error("empty catalog");
    cache = books;
    byId = new Map(books.map((b) => [b.id, b]));
    return books;
  })();
  try {
    return await loading;
  } finally {
    loading = null;
  }
}

export async function getCatalogBook(id: number): Promise<Book | null> {
  await loadCatalog();
  return byId?.get(id) ?? null;
}

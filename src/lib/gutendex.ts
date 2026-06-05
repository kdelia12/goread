import { normalizeBook, type BookList } from "./gutendex-normalize";
import type { Book } from "./types";
import { FIXTURE_BOOKS } from "./fixtures/books";
import { queryBooks, type SearchParams } from "./book-query";
import { loadCatalog, getCatalogBook } from "./catalog";

/**
 * Catalogue access. The live source is gutenberg.org's full `pg_catalog.csv`
 * feed (~75k books, reachable even when the gutendex.com API is down). Falls
 * back to the bundled fixture set when the feed is unreachable or when
 * GOREAD_USE_FIXTURES is set (tests, offline demo).
 */

export type { SearchParams };

function useFixtures(): boolean {
  const v = process.env.GOREAD_USE_FIXTURES;
  return v === "1" || v === "true";
}

// ── Fixture-backed helpers (unit-tested, no network) ────────────────────────

export const FIXTURE_CATALOGUE: Book[] = FIXTURE_BOOKS.map(normalizeBook);

export function fixtureSearch(params: SearchParams): BookList {
  return queryBooks(FIXTURE_CATALOGUE, params);
}

export function fixtureBook(id: number): Book | null {
  return FIXTURE_CATALOGUE.find((b) => b.id === id) ?? null;
}

// ── Circuit breaker for the catalogue feed ──────────────────────────────────

let catalogDownUntil = 0;
function catalogDown(): boolean {
  return Date.now() < catalogDownUntil;
}
function markCatalogDown(): void {
  catalogDownUntil = Date.now() + 60_000;
}

// ── Public async API (full catalogue with fixture fallback) ─────────────────

export async function searchBooks(params: SearchParams = {}): Promise<BookList> {
  if (useFixtures() || catalogDown()) return fixtureSearch(params);
  try {
    const all = await loadCatalog();
    return queryBooks(all, params);
  } catch {
    markCatalogDown();
    return fixtureSearch(params);
  }
}

export async function getBook(id: number): Promise<Book | null> {
  if (useFixtures() || catalogDown()) return fixtureBook(id);
  try {
    return (await getCatalogBook(id)) ?? fixtureBook(id);
  } catch {
    markCatalogDown();
    return fixtureBook(id);
  }
}

export async function getBooksByIds(ids: number[]): Promise<Book[]> {
  if (ids.length === 0) return [];
  if (useFixtures() || catalogDown()) {
    return ids.map(fixtureBook).filter((b): b is Book => b !== null);
  }
  try {
    const all = await loadCatalog();
    const want = new Set(ids);
    return all.filter((b) => want.has(b.id));
  } catch {
    markCatalogDown();
    return ids.map(fixtureBook).filter((b): b is Book => b !== null);
  }
}

import {
  normalizeBook,
  normalizeList,
  type BookList,
} from "./gutendex-normalize";
import type { Book } from "./types";
import { FIXTURE_BOOKS } from "./fixtures/books";

/**
 * Gutendex client. Hits the live API by default and gracefully falls back to
 * the bundled fixture catalogue on failure (or when GOREAD_USE_FIXTURES is set),
 * so the app never hard-depends on a single volunteer-run service.
 */

const PAGE_SIZE = 32;

export interface SearchParams {
  search?: string;
  topic?: string;
  languages?: string;
  sort?: "popular" | "ascending" | "descending";
  page?: number;
  ids?: number[];
}

function useFixtures(): boolean {
  const v = process.env.GOREAD_USE_FIXTURES;
  return v === "1" || v === "true";
}

function baseUrl(): string {
  return process.env.GUTENDEX_BASE_URL || "https://gutendex.com";
}

function buildQuery(params: SearchParams): string {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.topic) q.set("topic", params.topic);
  if (params.languages) q.set("languages", params.languages);
  if (params.sort) q.set("sort", params.sort);
  if (params.page) q.set("page", String(params.page));
  if (params.ids?.length) q.set("ids", params.ids.join(","));
  return q.toString();
}

async function fetchJson(url: string, timeoutMs = 8000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      // metadata is effectively immutable for our purposes; let the platform cache
      next: { revalidate: 60 * 60 * 24 },
    } as RequestInit);
    if (!res.ok) throw new Error(`Gutendex ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ── Fixture-backed pure helpers (unit-tested, no network) ───────────────────

export const FIXTURE_CATALOGUE: Book[] = FIXTURE_BOOKS.map(normalizeBook);

export function fixtureSearch(params: SearchParams): BookList {
  let results = [...FIXTURE_CATALOGUE];

  if (params.ids?.length) {
    const want = new Set(params.ids);
    results = results.filter((b) => want.has(b.id));
  }
  if (params.search) {
    const needle = params.search.toLowerCase();
    results = results.filter(
      (b) =>
        b.title.toLowerCase().includes(needle) ||
        b.authors.some((a) => a.name.toLowerCase().includes(needle)),
    );
  }
  if (params.topic) {
    const needle = params.topic.toLowerCase();
    results = results.filter(
      (b) =>
        b.subjects.some((s) => s.toLowerCase().includes(needle)) ||
        b.bookshelves.some((s) => s.toLowerCase().includes(needle)),
    );
  }
  if (params.languages) {
    const langs = new Set(params.languages.split(","));
    results = results.filter((b) => b.languages.some((l) => langs.has(l)));
  }

  if (params.sort === "ascending") results.sort((a, b) => a.id - b.id);
  else if (params.sort === "descending") results.sort((a, b) => b.id - a.id);
  else results.sort((a, b) => b.downloadCount - a.downloadCount); // popular default

  const page = Math.max(1, params.page ?? 1);
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = results.slice(start, start + PAGE_SIZE);

  return {
    count: results.length,
    next: start + PAGE_SIZE < results.length ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    results: pageItems,
  };
}

export function fixtureBook(id: number): Book | null {
  return FIXTURE_CATALOGUE.find((b) => b.id === id) ?? null;
}

// ── Public async API (network with fixture fallback) ────────────────────────

export async function searchBooks(params: SearchParams = {}): Promise<BookList> {
  if (useFixtures()) return fixtureSearch(params);
  try {
    const raw = await fetchJson(`${baseUrl()}/books?${buildQuery(params)}`);
    return normalizeList(raw as never);
  } catch {
    return fixtureSearch(params);
  }
}

export async function getBook(id: number): Promise<Book | null> {
  if (useFixtures()) return fixtureBook(id);
  try {
    const raw = await fetchJson(`${baseUrl()}/books/${id}`);
    return normalizeBook(raw as never);
  } catch {
    return fixtureBook(id);
  }
}

export async function getBooksByIds(ids: number[]): Promise<Book[]> {
  if (ids.length === 0) return [];
  if (useFixtures()) return ids.map(fixtureBook).filter((b): b is Book => b !== null);
  try {
    const list = await searchBooks({ ids });
    return list.results;
  } catch {
    return ids.map(fixtureBook).filter((b): b is Book => b !== null);
  }
}

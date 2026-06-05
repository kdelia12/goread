import type { Book } from "./types";
import type { BookList } from "./gutendex-normalize";

/** Search/browse/sort/paginate parameters, shared by fixtures and the full catalogue. */
export interface SearchParams {
  search?: string;
  topic?: string;
  languages?: string;
  sort?: "popular" | "ascending" | "descending";
  page?: number;
  ids?: number[];
}

export const PAGE_SIZE = 32;

/** Pure in-memory query over any book array (the bundled set or the full catalogue). */
export function queryBooks(all: Book[], params: SearchParams): BookList {
  let results = [...all];

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
  else results.sort((a, b) => b.downloadCount - a.downloadCount || a.id - b.id);

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

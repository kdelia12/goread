import { describe, it, expect } from "vitest";
import {
  normalizeBook,
  normalizeList,
  authorByline,
  type RawGutendexBook,
} from "./gutendex-normalize";

const RAW: RawGutendexBook = {
  id: 1342,
  title: "Pride and Prejudice",
  authors: [{ name: "Austen, Jane", birth_year: 1775, death_year: 1817 }],
  subjects: ["Courtship -- Fiction", "England -- Fiction"],
  bookshelves: ["Best Books Ever Listings"],
  languages: ["en"],
  summaries: ["A classic of English literature."],
  download_count: 54000,
  formats: {
    "application/epub+zip": "https://www.gutenberg.org/ebooks/1342.epub3.images",
    "text/plain; charset=utf-8": "https://www.gutenberg.org/ebooks/1342.txt.utf-8",
    "image/jpeg": "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg",
  },
};

describe("normalizeBook", () => {
  it("maps a full raw book into the canonical shape", () => {
    const book = normalizeBook(RAW);
    expect(book.id).toBe(1342);
    expect(book.title).toBe("Pride and Prejudice");
    expect(book.authors).toEqual([
      { name: "Austen, Jane", birthYear: 1775, deathYear: 1817 },
    ]);
    expect(book.subjects).toContain("England -- Fiction");
    expect(book.bookshelves).toEqual(["Best Books Ever Listings"]);
    expect(book.languages).toEqual(["en"]);
    expect(book.summary).toBe("A classic of English literature.");
    expect(book.downloadCount).toBe(54000);
    expect(book.epubUrl).toBe("https://www.gutenberg.org/ebooks/1342.epub3.images");
    expect(book.textUrl).toBe("https://www.gutenberg.org/ebooks/1342.txt.utf-8");
    expect(book.coverUrl).toBe(
      "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg",
    );
  });

  it("defaults missing fields without throwing", () => {
    const book = normalizeBook({});
    expect(book.id).toBe(0);
    expect(book.title).toBe("Untitled");
    expect(book.authors).toEqual([]);
    expect(book.subjects).toEqual([]);
    expect(book.summary).toBeNull();
    expect(book.downloadCount).toBe(0);
    expect(book.epubUrl).toBeNull();
    expect(book.coverUrl).toBeNull();
  });

  it("falls back to the cache cover url when no image format is present", () => {
    const book = normalizeBook({ id: 84, title: "Frankenstein", formats: {} });
    expect(book.coverUrl).toBe(
      "https://www.gutenberg.org/cache/epub/84/pg84.cover.medium.jpg",
    );
  });

  it("handles a malformed author entry", () => {
    const book = normalizeBook({ id: 1, authors: [{}] });
    expect(book.authors[0]).toEqual({
      name: "Unknown",
      birthYear: null,
      deathYear: null,
    });
  });
});

describe("normalizeList", () => {
  it("normalizes the paginated envelope", () => {
    const list = normalizeList({
      count: 1,
      next: "https://gutendex.com/books/?page=2",
      previous: null,
      results: [RAW],
    });
    expect(list.count).toBe(1);
    expect(list.next).toContain("page=2");
    expect(list.results).toHaveLength(1);
    expect(list.results[0].title).toBe("Pride and Prejudice");
  });

  it("tolerates an empty/garbage payload", () => {
    expect(normalizeList({})).toEqual({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });
  });
});

describe("authorByline", () => {
  it("joins author names", () => {
    expect(authorByline(normalizeBook(RAW))).toBe("Austen, Jane");
  });
  it("handles no authors", () => {
    expect(authorByline(normalizeBook({ id: 1 }))).toBe("Unknown author");
  });
});

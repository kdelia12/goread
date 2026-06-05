import { describe, it, expect } from "vitest";
import { normalizeSubjects, scorePair, recommend } from "./recommend";
import type { Book } from "./types";

function book(partial: Partial<Book> & { id: number }): Book {
  return {
    id: partial.id,
    title: partial.title ?? `Book ${partial.id}`,
    authors: partial.authors ?? [],
    subjects: partial.subjects ?? [],
    bookshelves: partial.bookshelves ?? [],
    languages: partial.languages ?? ["en"],
    summary: partial.summary ?? null,
    downloadCount: partial.downloadCount ?? 0,
    coverUrl: null,
    formats: {},
    epubUrl: null,
    textUrl: null,
  };
}

const austen = { name: "Austen, Jane", birthYear: 1775, deathYear: 1817 };
const shelley = { name: "Shelley, Mary", birthYear: 1797, deathYear: 1851 };

const seed = book({
  id: 1342,
  authors: [austen],
  subjects: ["Courtship -- Fiction", "England -- Fiction"],
  bookshelves: ["Best Books Ever Listings"],
  languages: ["en"],
});

describe("normalizeSubjects", () => {
  it("splits LoC strings on ' -- ' and lowercases", () => {
    const s = normalizeSubjects(["England -- Fiction", "Courtship -- Fiction"]);
    expect(s.has("england")).toBe(true);
    expect(s.has("fiction")).toBe(true);
    expect(s.has("courtship")).toBe(true);
  });
});

describe("scorePair weighting", () => {
  it("ranks same-author above a mere shared subject", () => {
    const sameAuthor = book({ id: 161, authors: [austen], subjects: ["Sisters -- Fiction"] });
    const sharedSubjectOnly = book({ id: 99, subjects: ["England -- Fiction"] });
    expect(scorePair(seed, sameAuthor).score).toBeGreaterThan(
      scorePair(seed, sharedSubjectOnly).score,
    );
  });

  it("ranks a shared curated bookshelf highest", () => {
    const sharedShelf = book({ id: 100, bookshelves: ["Best Books Ever Listings"] });
    const sharedSubject = book({ id: 101, subjects: ["England -- Fiction"] });
    expect(scorePair(seed, sharedShelf).score).toBeGreaterThan(
      scorePair(seed, sharedSubject).score,
    );
  });

  it("produces human-readable reasons", () => {
    const sameAuthor = book({ id: 161, authors: [austen] });
    expect(scorePair(seed, sameAuthor).reasons).toContain("By Austen, Jane");
  });

  it("scores an unrelated book at (almost) zero", () => {
    const unrelated = book({ id: 7, authors: [shelley], subjects: ["Monsters"], languages: ["fr"] });
    expect(scorePair(seed, unrelated).score).toBe(0);
  });
});

describe("recommend", () => {
  const candidates = [
    book({ id: 1342, authors: [austen] }), // the seed itself
    book({ id: 161, authors: [austen], downloadCount: 10 }), // Sense & Sensibility
    book({ id: 100, bookshelves: ["Best Books Ever Listings"], downloadCount: 5 }),
    book({ id: 84, authors: [shelley], subjects: ["Science fiction"], languages: ["fr"] }),
  ];

  it("excludes the seed and returns scored books sorted by relevance", () => {
    const recs = recommend(seed, candidates);
    expect(recs.map((r) => r.book.id)).not.toContain(1342);
    // curated bookshelf (weight 3) outranks same-author (weight 2)
    expect(recs[0].book.id).toBe(100);
    expect(recs[1].book.id).toBe(161);
    expect(recs.every((r) => r.score > 0)).toBe(true);
  });

  it("honours excludeIds and limit", () => {
    const recs = recommend(seed, candidates, { excludeIds: [161], limit: 1 });
    expect(recs).toHaveLength(1);
    expect(recs.map((r) => r.book.id)).not.toContain(161);
  });

  it("returns nothing for entirely unrelated candidates", () => {
    const recs = recommend(seed, [book({ id: 5, languages: ["de"], subjects: ["Cooking"] })]);
    expect(recs).toEqual([]);
  });
});

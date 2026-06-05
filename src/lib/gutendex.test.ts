import { describe, it, expect } from "vitest";
import {
  fixtureSearch,
  fixtureBook,
  FIXTURE_CATALOGUE,
} from "./gutendex";

describe("FIXTURE_CATALOGUE", () => {
  it("normalizes every bundled book", () => {
    expect(FIXTURE_CATALOGUE.length).toBeGreaterThanOrEqual(12);
    for (const b of FIXTURE_CATALOGUE) {
      expect(b.id).toBeGreaterThan(0);
      expect(b.title.length).toBeGreaterThan(0);
      expect(b.epubUrl).toBeTruthy();
      expect(b.coverUrl).toBeTruthy();
    }
  });
});

describe("fixtureSearch", () => {
  it("sorts by popularity by default", () => {
    const { results } = fixtureSearch({});
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].downloadCount).toBeGreaterThanOrEqual(
        results[i].downloadCount,
      );
    }
  });

  it("filters by title/author search", () => {
    const austen = fixtureSearch({ search: "austen" }).results;
    expect(austen.map((b) => b.id)).toContain(1342);
    expect(austen.every((b) => b.authors.some((a) => /austen/i.test(a.name)))).toBe(true);
    expect(fixtureSearch({ search: "sherlock" }).results[0].id).toBe(1661);
    expect(fixtureSearch({ search: "zzzz" }).results).toEqual([]);
  });

  it("filters by topic across subjects and bookshelves", () => {
    const gothic = fixtureSearch({ topic: "gothic" }).results.map((b) => b.id);
    expect(gothic).toContain(84); // Frankenstein
    expect(gothic).toContain(345); // Dracula
    expect(gothic).not.toContain(1232); // The Prince
  });

  it("filters by language", () => {
    expect(fixtureSearch({ languages: "fr" }).results).toEqual([]);
    // count is the full match total; results is one (paginated) page
    expect(fixtureSearch({ languages: "en" }).count).toBe(FIXTURE_CATALOGUE.length);
  });

  it("supports ascending/descending id sort", () => {
    const asc = fixtureSearch({ sort: "ascending" }).results.map((b) => b.id);
    const desc = fixtureSearch({ sort: "descending" }).results.map((b) => b.id);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it("paginates with next/previous cursors", () => {
    const p1 = fixtureSearch({ page: 1 });
    expect(p1.previous).toBeNull();
    expect(p1.count).toBe(FIXTURE_CATALOGUE.length);
  });

  it("filters by ids", () => {
    const r = fixtureSearch({ ids: [84, 11] }).results.map((b) => b.id).sort();
    expect(r).toEqual([11, 84]);
  });
});

describe("fixtureBook", () => {
  it("returns a single book or null", () => {
    expect(fixtureBook(1342)?.title).toMatch(/Pride and Prejudice/);
    expect(fixtureBook(999999)).toBeNull();
  });
});

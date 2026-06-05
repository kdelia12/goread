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
    expect(fixtureSearch({ search: "austen" }).results.map((b) => b.id)).toEqual([1342]);
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
    expect(fixtureSearch({ languages: "en" }).results.length).toBe(
      FIXTURE_CATALOGUE.length,
    );
  });

  it("supports ascending/descending id sort", () => {
    const asc = fixtureSearch({ sort: "ascending" }).results.map((b) => b.id);
    const desc = fixtureSearch({ sort: "descending" }).results.map((b) => b.id);
    expect(asc[0]).toBeLessThan(asc[asc.length - 1]);
    expect(desc).toEqual([...asc].reverse());
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

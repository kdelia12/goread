import { describe, it, expect } from "vitest";
import { parseCSV, parseAuthors, rowsToBooks } from "./catalog";

describe("parseCSV", () => {
  it("parses simple rows", () => {
    expect(parseCSV("a,b,c\n1,2,3")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });
  it("keeps commas inside quoted fields", () => {
    expect(parseCSV('1,"Frankenstein; Or, The Modern Prometheus",en')).toEqual([
      ["1", "Frankenstein; Or, The Modern Prometheus", "en"],
    ]);
  });
  it("unescapes doubled quotes", () => {
    expect(parseCSV('a,"he said ""hi""",b')).toEqual([["a", 'he said "hi"', "b"]]);
  });
  it("handles CRLF and newlines inside quotes", () => {
    expect(parseCSV('1,"line1\nline2",x\r\n2,y,z')).toEqual([
      ["1", "line1\nline2", "x"],
      ["2", "y", "z"],
    ]);
  });
});

describe("parseAuthors", () => {
  it("extracts name and lifespan", () => {
    expect(parseAuthors("Austen, Jane, 1775-1817")).toEqual([
      { name: "Austen, Jane", birthYear: 1775, deathYear: 1817 },
    ]);
  });
  it("handles a bare name", () => {
    expect(parseAuthors("Homer")).toEqual([{ name: "Homer", birthYear: null, deathYear: null }]);
  });
  it("splits multiple authors on semicolons", () => {
    const a = parseAuthors("Shelley, Mary, 1797-1851; Godwin, William, 1756-1836");
    expect(a).toHaveLength(2);
    expect(a[0].name).toBe("Shelley, Mary");
    expect(a[1].birthYear).toBe(1756);
  });
  it("is empty for a blank field", () => {
    expect(parseAuthors("")).toEqual([]);
  });
});

const CSV = `Text#,Type,Issued,Title,Language,Authors,Subjects,LoCC,Bookshelves
2554,Text,2001-03-28,Crime and Punishment,en,"Dostoyevsky, Fyodor, 1821-1881","Crime -- Fiction; Psychological fiction",PG,"Best Books Ever Listings"
84,Text,1993-10-01,"Frankenstein; Or, The Modern Prometheus",en,"Shelley, Mary Wollstonecraft, 1797-1851","Horror tales; Science fiction",PR,"Gothic Fiction; Movie Books"
9999,Sound,2020-01-01,An Audiobook,en,"Reader, A",Music,,`;

describe("rowsToBooks", () => {
  const books = rowsToBooks(parseCSV(CSV));

  it("maps Text entries and skips non-Text", () => {
    expect(books.map((b) => b.id).sort((a, b) => a - b)).toEqual([84, 2554]);
  });
  it("parses fields into the Book shape", () => {
    const cp = books.find((b) => b.id === 2554)!;
    expect(cp.title).toBe("Crime and Punishment");
    expect(cp.authors[0]).toEqual({ name: "Dostoyevsky, Fyodor", birthYear: 1821, deathYear: 1881 });
    expect(cp.subjects).toContain("Crime -- Fiction");
    expect(cp.bookshelves).toEqual(["Best Books Ever Listings"]);
    expect(cp.languages).toEqual(["en"]);
    expect(cp.coverUrl).toContain("/pg2554.cover");
  });
  it("borrows download counts from the curated set for popularity", () => {
    const cp = books.find((b) => b.id === 2554)!;
    expect(cp.downloadCount).toBeGreaterThan(0);
  });
});

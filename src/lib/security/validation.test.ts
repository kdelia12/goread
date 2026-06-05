import { describe, it, expect } from "vitest";
import {
  bookIdSchema,
  booksQuerySchema,
  preferencesPatchSchema,
  bookmarkInputSchema,
  syncPushSchema,
  parseInput,
} from "./validation";

describe("bookIdSchema", () => {
  it("coerces numeric strings and rejects junk", () => {
    expect(bookIdSchema.parse("1342")).toBe(1342);
    expect(bookIdSchema.safeParse("0").success).toBe(false);
    expect(bookIdSchema.safeParse("-1").success).toBe(false);
    expect(bookIdSchema.safeParse("1.5").success).toBe(false);
    expect(bookIdSchema.safeParse("abc").success).toBe(false);
    expect(bookIdSchema.safeParse("999999999").success).toBe(false); // > max
  });
});

describe("booksQuerySchema", () => {
  it("accepts a well-formed query", () => {
    const r = booksQuerySchema.safeParse({
      search: "austen",
      languages: "en,fr",
      sort: "popular",
      page: "2",
    });
    expect(r.success).toBe(true);
    expect(r.success && r.data.page).toBe(2);
  });

  it("rejects oversized search, bad lang, bad sort, out-of-range page", () => {
    expect(booksQuerySchema.safeParse({ search: "x".repeat(201) }).success).toBe(false);
    expect(booksQuerySchema.safeParse({ languages: "english" }).success).toBe(false);
    expect(booksQuerySchema.safeParse({ sort: "random" }).success).toBe(false);
    expect(booksQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(booksQuerySchema.safeParse({ page: "99999" }).success).toBe(false);
  });
});

describe("preferencesPatchSchema", () => {
  it("clamps are enforced", () => {
    expect(preferencesPatchSchema.safeParse({ fontSizePct: 150 }).success).toBe(true);
    expect(preferencesPatchSchema.safeParse({ fontSizePct: 5000 }).success).toBe(false);
    expect(preferencesPatchSchema.safeParse({ theme: "sepia" }).success).toBe(true);
    expect(preferencesPatchSchema.safeParse({ theme: "neon" }).success).toBe(false);
    expect(preferencesPatchSchema.safeParse({ lineHeight: 9 }).success).toBe(false);
  });
});

describe("bookmarkInputSchema", () => {
  const valid = {
    id: "bm_1",
    bookId: 1342,
    cfi: "epubcfi(/6/2)",
    percentage: 0.42,
    label: "A good bit",
    createdAt: 1,
    updatedAt: 2,
    deletedAt: null,
  };
  it("accepts a valid bookmark", () => {
    expect(bookmarkInputSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects percentage out of range and oversized cfi", () => {
    expect(bookmarkInputSchema.safeParse({ ...valid, percentage: 2 }).success).toBe(false);
    expect(bookmarkInputSchema.safeParse({ ...valid, cfi: "x".repeat(5000) }).success).toBe(false);
    expect(bookmarkInputSchema.safeParse({ ...valid, id: "" }).success).toBe(false);
  });
});

describe("syncPushSchema caps payload size", () => {
  it("rejects more than 2000 bookmarks", () => {
    const many = Array.from({ length: 2001 }, (_, i) => ({
      id: `b${i}`,
      bookId: 1,
      cfi: null,
      percentage: 0,
      label: null,
      createdAt: 0,
      updatedAt: 0,
      deletedAt: null,
    }));
    expect(syncPushSchema.safeParse({ bookmarks: many }).success).toBe(false);
  });
});

describe("parseInput helper", () => {
  it("returns ok+data on success", () => {
    expect(parseInput(bookIdSchema, "5")).toEqual({ ok: true, data: 5 });
  });
  it("returns a path-prefixed error on failure", () => {
    const r = parseInput(booksQuerySchema, { sort: "nope" });
    expect(r.ok).toBe(false);
    expect(r.ok === false && r.error).toMatch(/sort/);
  });
});

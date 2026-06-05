import { describe, it, expect, beforeEach } from "vitest";
import {
  saveProgress,
  getProgress,
  getAllProgress,
  toggleLibrary,
  inLibrary,
  getLibrary,
  addQuote,
  getQuotes,
  removeQuote,
  addBookmark,
  getBookmarks,
  removeBookmark,
  markReadToday,
  getReadingDays,
  cacheBook,
  pushRecent,
  getRecentBooks,
  savePreferences,
  getPreferences,
} from "./local-store";
import type { ReadingProgress } from "./types";

function prog(bookId: number, pct: number, updatedAt: number, cfi: string | null = null): ReadingProgress {
  return { bookId, cfi, percentage: pct, locationLabel: null, deviceId: null, updatedAt };
}

beforeEach(() => localStorage.clear());

describe("reading progress — resume from last read", () => {
  it("saves and restores the exact last position", () => {
    saveProgress(prog(1342, 0.42, 100, "chapter:3:0.5000"));
    const p = getProgress(1342);
    expect(p?.percentage).toBe(0.42);
    expect(p?.cfi).toBe("chapter:3:0.5000");
  });

  it("never regresses — furthest position wins even if a later save is earlier", () => {
    saveProgress(prog(1342, 0.8, 100));
    saveProgress(prog(1342, 0.3, 200)); // newer timestamp, earlier spot (stale device)
    expect(getProgress(1342)?.percentage).toBe(0.8);
  });

  it("advances when you genuinely read further", () => {
    saveProgress(prog(1342, 0.3, 100));
    saveProgress(prog(1342, 0.6, 200));
    expect(getProgress(1342)?.percentage).toBe(0.6);
  });

  it("tracks books independently", () => {
    saveProgress(prog(1, 0.2, 1));
    saveProgress(prog(2, 0.5, 1));
    expect(getAllProgress()).toHaveLength(2);
    expect(getProgress(2)?.percentage).toBe(0.5);
    expect(getProgress(999)).toBeNull();
  });
});

describe("library save/unsave", () => {
  it("toggles and persists", () => {
    expect(inLibrary(84)).toBe(false);
    expect(toggleLibrary(84)).toBe(true);
    expect(inLibrary(84)).toBe(true);
    expect(getLibrary()).toContain(84);
    expect(toggleLibrary(84)).toBe(false);
    expect(inLibrary(84)).toBe(false);
  });
});

describe("quotes", () => {
  it("adds, filters by book, and removes", () => {
    addQuote({ id: "q1", bookId: 1, bookTitle: "X", author: "A", text: "hi", note: null, createdAt: 1 });
    addQuote({ id: "q2", bookId: 2, bookTitle: "Y", author: "B", text: "yo", note: null, createdAt: 2 });
    expect(getQuotes()).toHaveLength(2);
    expect(getQuotes(1).map((q) => q.id)).toEqual(["q1"]);
    removeQuote("q1");
    expect(getQuotes()).toHaveLength(1);
  });
});

describe("bookmarks", () => {
  it("adds and soft-deletes via tombstone", () => {
    addBookmark({
      id: "b1",
      bookId: 1,
      cfi: "chapter:1",
      percentage: 0.1,
      label: "x",
      createdAt: 1,
      updatedAt: 1,
      deletedAt: null,
    });
    expect(getBookmarks(1)).toHaveLength(1);
    removeBookmark("b1");
    expect(getBookmarks(1)).toHaveLength(0); // tombstoned, filtered from live view
  });
});

describe("reading days + recents (streak + continue-reading)", () => {
  it("records today's reading day", () => {
    markReadToday(Date.UTC(2026, 5, 6, 12, 0, 0), 0);
    expect(getReadingDays()).toContain("2026-06-06");
  });

  it("caches recently opened books for the continue-reading rail", () => {
    cacheBook({ id: 7, title: "Title", author: "Author", coverUrl: null });
    pushRecent(7);
    expect(getRecentBooks().map((b) => b.id)).toContain(7);
  });
});

describe("preferences", () => {
  it("round-trips a patch and preserves defaults", () => {
    const p = savePreferences({ theme: "sepia", fontSizePct: 130 });
    expect(p.theme).toBe("sepia");
    expect(p.fontSizePct).toBe(130);
    expect(getPreferences().readerFont).toBe("literata");
  });
});

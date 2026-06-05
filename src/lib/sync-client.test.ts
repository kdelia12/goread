import { describe, it, expect, beforeEach } from "vitest";
import { collectPush, applyPulledBookmarks, applyPulledProgress } from "./sync-client";
import { addBookmark, getBookmarks, saveProgress, getProgress, getAllBookmarksRaw } from "./local-store";
import type { Bookmark, ReadingProgress } from "./types";

function bm(id: string, updatedAt: number, deletedAt: number | null = null): Bookmark {
  return { id, bookId: 1, cfi: null, percentage: 0.1, label: id, createdAt: 1, updatedAt, deletedAt };
}
function prog(bookId: number, pct: number, updatedAt: number): ReadingProgress {
  return { bookId, cfi: null, percentage: pct, locationLabel: null, deviceId: null, updatedAt };
}

beforeEach(() => localStorage.clear());

describe("collectPush", () => {
  it("gathers local bookmarks (incl. tombstones) and progress for upload", () => {
    addBookmark(bm("a", 5));
    saveProgress(prog(1, 0.3, 5));
    const payload = collectPush();
    expect(payload.bookmarks.map((b) => b.id)).toContain("a");
    expect(payload.progress[0].percentage).toBe(0.3);
  });
});

describe("applyPulledBookmarks — guest↔account merge", () => {
  it("keeps the newer side per id and propagates remote tombstones", () => {
    addBookmark(bm("a", 100)); // local
    addBookmark(bm("b", 100));
    const merged = applyPulledBookmarks([bm("a", 200), bm("c", 50)]); // remote
    const byId = Object.fromEntries(merged.map((m) => [m.id, m.updatedAt]));
    expect(byId).toEqual({ a: 200, b: 100, c: 50 });
    // tombstone from remote wins when newer
    applyPulledBookmarks([bm("b", 300, 300)]);
    expect(getBookmarks(1).find((m) => m.id === "b")).toBeUndefined();
    expect(getAllBookmarksRaw().find((m) => m.id === "b")?.deletedAt).toBe(300);
  });
});

describe("applyPulledProgress — never regress", () => {
  it("takes the furthest position across local and pulled", () => {
    saveProgress(prog(1, 0.8, 10)); // local further
    applyPulledProgress([prog(1, 0.2, 999)]); // remote newer but earlier
    expect(getProgress(1)?.percentage).toBe(0.8);
    applyPulledProgress([prog(1, 0.95, 5)]); // remote further
    expect(getProgress(1)?.percentage).toBe(0.95);
  });
});

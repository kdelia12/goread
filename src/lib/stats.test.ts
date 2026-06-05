import { describe, it, expect } from "vitest";
import { computeReadingStats } from "./stats";
import type { ReadingProgress } from "./types";
import type { Quote } from "./share/quotes";

function prog(bookId: number, pct: number): ReadingProgress {
  return { bookId, cfi: null, percentage: pct, locationLabel: null, deviceId: null, updatedAt: 0 };
}
function quote(id: string): Quote {
  return { id, bookId: 1, bookTitle: "X", author: "A", text: "t", note: null, createdAt: 0 };
}

describe("computeReadingStats", () => {
  it("counts reading vs finished by percentage", () => {
    const stats = computeReadingStats({
      progress: [prog(1, 0.4), prog(2, 1), prog(3, 0.999), prog(4, 0)],
      libraryCount: 5,
      quotes: [quote("a"), quote("b")],
      readingDays: ["2026-06-05", "2026-06-06"],
      todayKey: "2026-06-06",
    });
    expect(stats.reading).toBe(1); // only book 1 (0<pct<0.995)
    expect(stats.finished).toBe(2); // books 2 and 3
    expect(stats.saved).toBe(5);
    expect(stats.quotes).toBe(2);
    expect(stats.currentStreak).toBe(2);
    expect(stats.daysRead).toBe(2);
  });

  it("is all zeros for a fresh reader", () => {
    expect(
      computeReadingStats({
        progress: [],
        libraryCount: 0,
        quotes: [],
        readingDays: [],
        todayKey: "2026-06-06",
      }),
    ).toMatchObject({ reading: 0, finished: 0, saved: 0, quotes: 0, currentStreak: 0, daysRead: 0 });
  });
});

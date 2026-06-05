import { describe, it, expect } from "vitest";
import {
  clampPercentage,
  hasPosition,
  isFurther,
  pickFurthest,
  formatPercent,
  progressLabel,
} from "./reading-position";
import type { ReadingProgress } from "./types";

function prog(p: number, updatedAt = 0, cfi: string | null = null): ReadingProgress {
  return { bookId: 1, cfi, percentage: p, locationLabel: null, deviceId: null, updatedAt };
}

describe("clampPercentage", () => {
  it("clamps into 0..1 and rejects garbage", () => {
    expect(clampPercentage(0.5)).toBe(0.5);
    expect(clampPercentage(-3)).toBe(0);
    expect(clampPercentage(9)).toBe(1);
    expect(clampPercentage(NaN)).toBe(0);
    // @ts-expect-error testing runtime guard
    expect(clampPercentage("x")).toBe(0);
  });
});

describe("hasPosition", () => {
  it("is true with a percentage or a cfi", () => {
    expect(hasPosition(prog(0.1))).toBe(true);
    expect(hasPosition(prog(0, 0, "epubcfi(/6/2)"))).toBe(true);
    expect(hasPosition(prog(0))).toBe(false);
    expect(hasPosition(null)).toBe(false);
  });
});

describe("isFurther / pickFurthest", () => {
  it("further percentage wins", () => {
    expect(isFurther(prog(0.6), prog(0.3))).toBe(true);
    expect(pickFurthest(prog(0.6, 1), prog(0.3, 999))!.percentage).toBe(0.6);
  });

  it("does not regress when a stale device syncs an earlier position", () => {
    const ahead = prog(0.8, 100);
    const stale = prog(0.2, 200); // newer timestamp, earlier position
    expect(pickFurthest(stale, ahead)!.percentage).toBe(0.8);
  });

  it("breaks ties by recency", () => {
    expect(isFurther(prog(0.5, 200), prog(0.5, 100))).toBe(true);
    expect(pickFurthest(prog(0.5, 100), prog(0.5, 200))!.updatedAt).toBe(200);
  });

  it("handles null operands", () => {
    expect(pickFurthest(null, prog(0.4))!.percentage).toBe(0.4);
    expect(pickFurthest(prog(0.4), null)!.percentage).toBe(0.4);
    expect(pickFurthest(null, null)).toBeNull();
  });
});

describe("formatPercent / progressLabel", () => {
  it("formats a rounded percentage", () => {
    expect(formatPercent(0.426)).toBe("43%");
    expect(formatPercent(0)).toBe("0%");
  });

  it("labels progress states", () => {
    expect(progressLabel(null)).toBe("Not started");
    expect(progressLabel(prog(0))).toBe("Not started");
    expect(progressLabel(prog(0.43))).toBe("43% read");
    expect(progressLabel(prog(1))).toBe("Finished");
  });
});

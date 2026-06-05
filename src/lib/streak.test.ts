import { describe, it, expect } from "vitest";
import { dayKey, dayNumber, computeStreak, recordReadingDay } from "./streak";

describe("dayKey", () => {
  it("formats a local calendar day", () => {
    // 2026-06-06T10:00:00Z, UTC+7 (offset -420) -> still the 6th locally
    expect(dayKey(Date.UTC(2026, 5, 6, 10, 0, 0), -420)).toBe("2026-06-06");
  });
  it("rolls over with timezone offset", () => {
    // 2026-06-06T20:00:00Z in UTC+7 is 2026-06-07 03:00 local
    expect(dayKey(Date.UTC(2026, 5, 6, 20, 0, 0), -420)).toBe("2026-06-07");
  });
});

describe("dayNumber", () => {
  it("is consecutive for consecutive days", () => {
    expect(dayNumber("2026-06-07") - dayNumber("2026-06-06")).toBe(1);
    // 2026 is not a leap year, so Feb 28 -> Mar 1 is a single day
    expect(dayNumber("2026-03-01") - dayNumber("2026-02-28")).toBe(1);
  });
});

describe("computeStreak", () => {
  it("counts a run ending today", () => {
    const days = ["2026-06-04", "2026-06-05", "2026-06-06"];
    expect(computeStreak(days, "2026-06-06")).toMatchObject({ current: 3, longest: 3 });
  });

  it("keeps the streak alive if you read yesterday but not yet today", () => {
    const days = ["2026-06-04", "2026-06-05"];
    expect(computeStreak(days, "2026-06-06").current).toBe(2);
  });

  it("resets to zero after missing a full day", () => {
    const days = ["2026-06-01", "2026-06-02"];
    expect(computeStreak(days, "2026-06-06").current).toBe(0);
  });

  it("tracks the longest run independent of the current one", () => {
    const days = ["2026-05-01", "2026-05-02", "2026-05-03", "2026-05-04", "2026-06-06"];
    const r = computeStreak(days, "2026-06-06");
    expect(r.longest).toBe(4);
    expect(r.current).toBe(1);
    expect(r.lastReadDay).toBe("2026-06-06");
  });

  it("ignores duplicate days", () => {
    expect(computeStreak(["2026-06-06", "2026-06-06"], "2026-06-06").current).toBe(1);
  });

  it("handles no history", () => {
    expect(computeStreak([], "2026-06-06")).toEqual({ current: 0, longest: 0, lastReadDay: null });
  });
});

describe("recordReadingDay", () => {
  it("adds today once and stays sorted", () => {
    expect(recordReadingDay(["2026-06-04"], "2026-06-06")).toEqual([
      "2026-06-04",
      "2026-06-06",
    ]);
    expect(recordReadingDay(["2026-06-06"], "2026-06-06")).toEqual(["2026-06-06"]);
  });
});

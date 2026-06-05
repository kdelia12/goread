import type { ReadingProgress } from "./types";
import type { Quote } from "./share/quotes";
import { computeStreak } from "./streak";
import { clampPercentage } from "./reading-position";

/** A signed-in reader's dashboard numbers. */
export interface ReadingStats {
  reading: number;
  finished: number;
  saved: number;
  quotes: number;
  currentStreak: number;
  longestStreak: number;
  daysRead: number;
}

export interface StatsInput {
  progress: ReadingProgress[];
  libraryCount: number;
  quotes: Quote[];
  readingDays: string[];
  todayKey: string;
}

const FINISHED = 0.995;

export function computeReadingStats(input: StatsInput): ReadingStats {
  const reading = input.progress.filter((p) => {
    const pct = clampPercentage(p.percentage);
    return pct > 0 && pct < FINISHED;
  }).length;
  const finished = input.progress.filter((p) => clampPercentage(p.percentage) >= FINISHED).length;
  const streak = computeStreak(input.readingDays, input.todayKey);

  return {
    reading,
    finished,
    saved: input.libraryCount,
    quotes: input.quotes.length,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    daysRead: new Set(input.readingDays).size,
  };
}

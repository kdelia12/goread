import type { ReadingProgress } from "./types";

/** Coerce any value into a clean 0..1 fraction. NaN/garbage -> 0. */
export function clampPercentage(p: number): number {
  if (typeof p !== "number" || Number.isNaN(p)) return 0;
  if (p < 0) return 0;
  if (p > 1) return 1;
  return p;
}

export function hasPosition(p: ReadingProgress | null | undefined): boolean {
  if (!p) return false;
  return p.percentage > 0 || (p.cfi !== null && p.cfi !== undefined);
}

/**
 * Is `a` further into the book than `b`? Position uses percentage as the
 * renderer-agnostic measure; ties break toward the more recently updated.
 */
export function isFurther(a: ReadingProgress, b: ReadingProgress): boolean {
  const pa = clampPercentage(a.percentage);
  const pb = clampPercentage(b.percentage);
  if (pa !== pb) return pa > pb;
  return a.updatedAt > b.updatedAt;
}

/**
 * Furthest-position-wins merge for reading progress. We never want syncing a
 * stale device to yank the reader backwards, so this is deliberately NOT
 * last-write-wins.
 */
export function pickFurthest(
  a: ReadingProgress | null,
  b: ReadingProgress | null,
): ReadingProgress | null {
  if (!a) return b;
  if (!b) return a;
  return isFurther(a, b) ? a : b;
}

export function formatPercent(p: number): string {
  return `${Math.round(clampPercentage(p) * 100)}%`;
}

/** "page 12 of 340"-style label is left to the renderer; this is the headline. */
export function progressLabel(p: ReadingProgress | null | undefined): string {
  if (!hasPosition(p ?? null)) return "Not started";
  const pct = clampPercentage(p!.percentage);
  if (pct >= 0.995) return "Finished";
  return `${formatPercent(pct)} read`;
}

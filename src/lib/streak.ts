/**
 * Reading-streak engine. Pure and timezone-aware via an injected offset, so it
 * is deterministic and unit-testable (no Date.now / new Date in the logic).
 * Days are tracked as local "YYYY-MM-DD" keys; a streak survives until you miss
 * a whole day (reading yesterday but not yet today still counts).
 */

export interface StreakResult {
  current: number;
  longest: number;
  lastReadDay: string | null;
}

/** Local calendar day for an epoch-ms instant. `tzOffsetMin` = Date#getTimezoneOffset(). */
export function dayKey(epochMs: number, tzOffsetMin = 0): string {
  const local = new Date(epochMs - tzOffsetMin * 60_000);
  const y = local.getUTCFullYear();
  const m = String(local.getUTCMonth() + 1).padStart(2, "0");
  const d = String(local.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Whole-day index for a YYYY-MM-DD key (days since the Unix epoch). */
export function dayNumber(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

function keyFromNumber(n: number): string {
  return dayKey(n * 86_400_000, 0);
}

export function computeStreak(days: string[], todayKey: string): StreakResult {
  const nums = Array.from(new Set(days.map(dayNumber))).sort((a, b) => a - b);
  if (nums.length === 0) return { current: 0, longest: 0, lastReadDay: null };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < nums.length; i++) {
    run = nums[i] === nums[i - 1] + 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  const set = new Set(nums);
  const today = dayNumber(todayKey);
  // anchor on today if read, else yesterday (grace period before the streak breaks)
  const anchor = set.has(today) ? today : set.has(today - 1) ? today - 1 : null;
  let current = 0;
  if (anchor !== null) {
    let d = anchor;
    while (set.has(d)) {
      current++;
      d--;
    }
  }

  return { current, longest, lastReadDay: keyFromNumber(nums[nums.length - 1]) };
}

/** Mark a day as read; returns a new sorted, de-duplicated array. */
export function recordReadingDay(days: string[], todayKey: string): string[] {
  const set = new Set(days);
  set.add(todayKey);
  return Array.from(set).sort();
}

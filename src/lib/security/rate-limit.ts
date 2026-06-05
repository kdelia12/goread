/**
 * In-memory sliding-window rate limiter. Deterministic: the caller injects
 * `now` (epoch ms), so it is fully unit-testable and free of Date.now(). Good
 * enough as a first line of defence per serverless instance; swap in
 * Upstash/Redis for a shared limit across instances in production.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** epoch ms when the window frees up the next slot */
  resetAt: number;
}

/** Pure core: given prior hit timestamps, decide on a new request at `now`. */
export function evaluateWindow(
  hits: number[],
  now: number,
  limit: number,
  windowMs: number,
): { result: RateLimitResult; hits: number[] } {
  const cutoff = now - windowMs;
  const recent = hits.filter((t) => t > cutoff);
  if (recent.length >= limit) {
    const resetAt = recent[0] + windowMs;
    return { result: { allowed: false, remaining: 0, resetAt }, hits: recent };
  }
  recent.push(now);
  return {
    result: {
      allowed: true,
      remaining: limit - recent.length,
      resetAt: now + windowMs,
    },
    hits: recent,
  };
}

export class RateLimiter {
  private store = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  check(key: string, now: number): RateLimitResult {
    const { result, hits } = evaluateWindow(
      this.store.get(key) ?? [],
      now,
      this.limit,
      this.windowMs,
    );
    this.store.set(key, hits);
    return result;
  }

  /** Drop windows that are fully expired to bound memory. */
  sweep(now: number): void {
    const cutoff = now - this.windowMs;
    for (const [key, hits] of this.store) {
      const recent = hits.filter((t) => t > cutoff);
      if (recent.length === 0) this.store.delete(key);
      else this.store.set(key, recent);
    }
  }

  get size(): number {
    return this.store.size;
  }
}

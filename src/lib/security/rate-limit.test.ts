import { describe, it, expect } from "vitest";
import { evaluateWindow, RateLimiter } from "./rate-limit";

describe("evaluateWindow", () => {
  it("allows up to the limit then blocks", () => {
    let hits: number[] = [];
    for (let i = 0; i < 3; i++) {
      const r = evaluateWindow(hits, 1000 + i, 3, 1000);
      hits = r.hits;
      expect(r.result.allowed).toBe(true);
    }
    const blocked = evaluateWindow(hits, 1003, 3, 1000);
    expect(blocked.result.allowed).toBe(false);
    expect(blocked.result.remaining).toBe(0);
  });

  it("frees slots once the window slides past old hits", () => {
    const hits = [100, 200, 300];
    // now far beyond window: all old hits expire
    const r = evaluateWindow(hits, 2000, 3, 1000);
    expect(r.result.allowed).toBe(true);
    expect(r.hits).toEqual([2000]);
  });

  it("reports a resetAt when blocked", () => {
    const hits = [1000, 1001, 1002];
    const r = evaluateWindow(hits, 1003, 3, 1000);
    expect(r.result.resetAt).toBe(2000); // first hit + window
  });
});

describe("RateLimiter", () => {
  it("tracks keys independently", () => {
    const rl = new RateLimiter(2, 1000);
    expect(rl.check("a", 0).allowed).toBe(true);
    expect(rl.check("a", 1).allowed).toBe(true);
    expect(rl.check("a", 2).allowed).toBe(false);
    expect(rl.check("b", 2).allowed).toBe(true); // different key, fresh budget
  });

  it("sweeps expired windows to bound memory", () => {
    const rl = new RateLimiter(2, 1000);
    rl.check("a", 0);
    expect(rl.size).toBe(1);
    rl.sweep(5000);
    expect(rl.size).toBe(0);
  });
});

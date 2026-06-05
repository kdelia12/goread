import { describe, it, expect } from "vitest";
import {
  mergeRecord,
  mergeCollections,
  mergeProgress,
  changedSince,
  type SyncRecord,
} from "./sync-merge";
import type { Bookmark, ReadingProgress } from "./types";

function bm(id: string, updatedAt: number, deletedAt: number | null = null): Bookmark {
  return {
    id,
    bookId: 1,
    cfi: null,
    percentage: 0.1,
    label: id,
    createdAt: 0,
    updatedAt,
    deletedAt,
  };
}

describe("mergeRecord (last-write-wins)", () => {
  it("newer updatedAt wins on either side", () => {
    expect(mergeRecord(bm("a", 200), bm("a", 100)).updatedAt).toBe(200);
    expect(mergeRecord(bm("a", 100), bm("a", 200)).updatedAt).toBe(200);
  });
  it("returns the present side when one is missing", () => {
    expect(mergeRecord(undefined, bm("a", 1)).id).toBe("a");
    expect(mergeRecord(bm("a", 1), undefined).id).toBe("a");
  });
  it("ties favour the remote", () => {
    const local = bm("a", 100);
    const remote = bm("a", 100);
    expect(mergeRecord(local, remote)).toBe(remote);
  });
});

describe("mergeCollections", () => {
  it("unions by id and resolves each by LWW", () => {
    const local = [bm("a", 100), bm("b", 100)];
    const remote = [bm("a", 200), bm("c", 50)];
    const merged = mergeCollections(local, remote);
    const byId = Object.fromEntries(merged.map((m) => [m.id, m.updatedAt]));
    expect(byId).toEqual({ a: 200, b: 100, c: 50 });
  });

  it("propagates a tombstone delete that is newer", () => {
    const local = [bm("a", 100)];
    const remote = [bm("a", 200, 200)]; // deleted later
    const merged = mergeCollections(local, remote);
    expect(merged.find((m) => m.id === "a")?.deletedAt).toBe(200);
  });

  it("can drop tombstones for the live render set", () => {
    const merged = mergeCollections([bm("a", 100)], [bm("a", 200, 200)], {
      dropTombstones: true,
    });
    expect(merged).toHaveLength(0);
  });

  it("an edit that is newer than a delete revives the record", () => {
    const local = [bm("a", 300)]; // edited after the delete
    const remote = [bm("a", 200, 200)];
    const merged = mergeCollections(local, remote);
    expect(merged.find((m) => m.id === "a")?.deletedAt).toBeNull();
  });
});

describe("mergeProgress", () => {
  function prog(p: number, updatedAt: number): ReadingProgress {
    return { bookId: 1, cfi: null, percentage: p, locationLabel: null, deviceId: null, updatedAt };
  }
  it("keeps the furthest position even if a stale device is newer", () => {
    expect(mergeProgress(prog(0.2, 999), prog(0.8, 1))!.percentage).toBe(0.8);
  });
});

describe("changedSince", () => {
  it("returns only records strictly after the cursor", () => {
    const recs: SyncRecord[] = [
      { id: "a", updatedAt: 10 },
      { id: "b", updatedAt: 20 },
      { id: "c", updatedAt: 30 },
    ];
    expect(changedSince(recs, 20).map((r) => r.id)).toEqual(["c"]);
  });
});

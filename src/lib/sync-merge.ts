import type { ReadingProgress } from "./types";
import { pickFurthest } from "./reading-position";

/**
 * Offline-first delta-sync conflict resolution. Bookmarks/highlights/prefs use
 * per-record last-write-wins by `updatedAt`. Reading progress is special-cased
 * to furthest-position-wins (see reading-position). Deletes are tombstones
 * (`deletedAt`) so they survive a round trip and don't resurrect.
 */
export interface SyncRecord {
  id: string;
  updatedAt: number;
  deletedAt?: number | null;
}

/** Last-write-wins for a single record. Ties favour the remote (server is canonical). */
export function mergeRecord<T extends { updatedAt: number }>(
  local: T | undefined,
  remote: T | undefined,
): T {
  if (local === undefined) return remote as T;
  if (remote === undefined) return local;
  return local.updatedAt > remote.updatedAt ? local : remote;
}

/**
 * Merge two collections of sync records by id. Returns one entry per id, each
 * resolved by LWW. Tombstones are kept (so deletions propagate); pass
 * `dropTombstones` to get only the live set for rendering.
 */
export function mergeCollections<T extends SyncRecord>(
  local: T[],
  remote: T[],
  { dropTombstones = false }: { dropTombstones?: boolean } = {},
): T[] {
  const byId = new Map<string, T>();
  for (const rec of local) byId.set(rec.id, rec);
  for (const rec of remote) {
    byId.set(rec.id, mergeRecord(byId.get(rec.id), rec));
  }
  const merged = [...byId.values()];
  return dropTombstones ? merged.filter((r) => !r.deletedAt) : merged;
}

/** Furthest-position-wins for a single book's progress. */
export function mergeProgress(
  local: ReadingProgress | null,
  remote: ReadingProgress | null,
): ReadingProgress | null {
  return pickFurthest(local, remote);
}

/** Select records changed strictly after `since` — the delta-pull payload. */
export function changedSince<T extends { updatedAt: number }>(
  records: T[],
  since: number,
): T[] {
  return records.filter((r) => r.updatedAt > since);
}

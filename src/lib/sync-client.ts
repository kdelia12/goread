import type { Bookmark, ReadingProgress } from "./types";
import {
  getAllBookmarksRaw,
  replaceBookmarks,
  getAllProgress,
  saveProgress,
  getPreferences,
  savePreferences,
} from "./local-store";
import { mergeCollections } from "./sync-merge";

/**
 * Client-side sync. On sign-in we push local (guest) data up and pull the
 * account's data down, merging both ways — this is also the guest→account
 * hand-off. Convergence relies on the tested merge logic (bookmarks: LWW by
 * updatedAt incl. tombstones; progress: furthest-position-wins).
 */

export interface PushPayload {
  bookmarks: Bookmark[];
  progress: ReadingProgress[];
}

export function collectPush(): PushPayload {
  return { bookmarks: getAllBookmarksRaw(), progress: getAllProgress() };
}

/** Merge pulled bookmarks into local storage; returns the merged set. */
export function applyPulledBookmarks(remote: Bookmark[]): Bookmark[] {
  const merged = mergeCollections(getAllBookmarksRaw(), remote);
  replaceBookmarks(merged);
  return merged;
}

/** Apply pulled progress (furthest-position-wins per book). */
export function applyPulledProgress(remote: ReadingProgress[]): void {
  for (const p of remote) saveProgress(p);
}

async function getJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url);
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function preferenceSync(): Promise<void> {
  const local = getPreferences();
  const res = await getJson("/api/preferences");
  if (!res || res.enabled === false) return;
  const remote = res.preferences as (typeof local & { updatedAt: number }) | null;
  if (remote && remote.updatedAt > local.updatedAt) {
    savePreferences({
      theme: remote.theme,
      readerFont: remote.readerFont,
      fontSizePct: remote.fontSizePct,
      lineHeight: remote.lineHeight,
      marginPct: remote.marginPct,
    });
  } else {
    await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theme: local.theme,
        readerFont: local.readerFont,
        fontSizePct: local.fontSizePct,
        lineHeight: local.lineHeight,
        marginPct: local.marginPct,
      }),
    }).catch(() => undefined);
  }
}

/** Full two-way sync. No-ops (synced:false) in guest mode or on any error. */
export async function syncNow(): Promise<{ synced: boolean }> {
  try {
    const pushRes = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectPush()),
    });
    const push = (await pushRes.json()) as { enabled?: boolean };
    if (!push || push.enabled === false) return { synced: false };

    const pull = (await getJson("/api/sync?since=0")) as {
      enabled?: boolean;
      bookmarks?: Bookmark[];
      progress?: ReadingProgress[];
    } | null;
    if (!pull || pull.enabled === false) return { synced: false };

    applyPulledBookmarks(pull.bookmarks ?? []);
    applyPulledProgress(pull.progress ?? []);
    await preferenceSync();
    return { synced: true };
  } catch {
    return { synced: false };
  }
}

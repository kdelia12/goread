/**
 * Guest-mode persistence in localStorage. In auth mode the same shapes are
 * mirrored to the account via /api/sync, but everything works offline and
 * keyless through this module. All reads are SSR-safe (return fallbacks on the
 * server) so components can call them without guarding.
 */
import type { Bookmark, Preferences, ReadingProgress } from "./types";
import { DEFAULT_PREFERENCES } from "./types";
import { dayKey, recordReadingDay } from "./streak";
import { pickFurthest } from "./reading-position";
import type { Quote } from "./share/quotes";

const NS = "goread:v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(`${NS}:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
  } catch {
    /* quota / privacy mode — ignore */
  }
}

// ── Reading streak ──────────────────────────────────────────────────────────
export function getReadingDays(): string[] {
  return read<string[]>("readingDays", []);
}
export function markReadToday(now = Date.now(), tzOffsetMin?: number): string[] {
  const offset = tzOffsetMin ?? new Date().getTimezoneOffset();
  const days = recordReadingDay(getReadingDays(), dayKey(now, offset));
  write("readingDays", days);
  return days;
}

// ── Reading progress (furthest-position-wins) ───────────────────────────────
type ProgressMap = Record<string, ReadingProgress>;
export function getProgress(bookId: number): ReadingProgress | null {
  return read<ProgressMap>("progress", {})[String(bookId)] ?? null;
}
export function getAllProgress(): ReadingProgress[] {
  return Object.values(read<ProgressMap>("progress", {}));
}
export function saveProgress(p: ReadingProgress): void {
  const all = read<ProgressMap>("progress", {});
  const existing = all[String(p.bookId)] ?? null;
  all[String(p.bookId)] = pickFurthest(existing, p) ?? p;
  write("progress", all);
}

// ── Recently opened + lightweight book cache ────────────────────────────────
export interface BookStub {
  id: number;
  title: string;
  author: string;
  coverUrl: string | null;
}
type BookCache = Record<string, BookStub>;

export function pushRecent(bookId: number): void {
  const next = [bookId, ...getRecents().filter((id) => id !== bookId)].slice(0, 24);
  write("recents", next);
}
export function getRecents(): number[] {
  return read<number[]>("recents", []);
}
export function cacheBook(stub: BookStub): void {
  const cache = read<BookCache>("bookCache", {});
  cache[String(stub.id)] = stub;
  write("bookCache", cache);
}
export function getCachedBook(id: number): BookStub | null {
  return read<BookCache>("bookCache", {})[String(id)] ?? null;
}
export function getRecentBooks(): BookStub[] {
  const cache = read<BookCache>("bookCache", {});
  return getRecents()
    .map((id) => cache[String(id)])
    .filter((b): b is BookStub => Boolean(b));
}

// ── Library (saved books) ───────────────────────────────────────────────────
export function getLibrary(): number[] {
  return read<number[]>("library", []);
}
export function inLibrary(bookId: number): boolean {
  return getLibrary().includes(bookId);
}
export function toggleLibrary(bookId: number): boolean {
  const lib = getLibrary();
  const has = lib.includes(bookId);
  write("library", has ? lib.filter((id) => id !== bookId) : [bookId, ...lib]);
  return !has;
}

// ── Bookmarks ───────────────────────────────────────────────────────────────
export function getBookmarks(bookId?: number): Bookmark[] {
  const all = read<Bookmark[]>("bookmarks", []).filter((b) => !b.deletedAt);
  return bookId ? all.filter((b) => b.bookId === bookId) : all;
}
export function addBookmark(b: Bookmark): void {
  write("bookmarks", [b, ...read<Bookmark[]>("bookmarks", []).filter((x) => x.id !== b.id)]);
}
export function removeBookmark(id: string): void {
  const now = Date.now();
  write(
    "bookmarks",
    read<Bookmark[]>("bookmarks", []).map((b) =>
      b.id === id ? { ...b, deletedAt: now, updatedAt: now } : b,
    ),
  );
}

/** All bookmarks including tombstones — used by the sync push/merge. */
export function getAllBookmarksRaw(): Bookmark[] {
  return read<Bookmark[]>("bookmarks", []);
}
export function replaceBookmarks(list: Bookmark[]): void {
  write("bookmarks", list);
}

// ── Quotes ──────────────────────────────────────────────────────────────────
export function getQuotes(bookId?: number): Quote[] {
  const all = read<Quote[]>("quotes", []);
  return bookId ? all.filter((q) => q.bookId === bookId) : all;
}
export function addQuote(q: Quote): void {
  write("quotes", [q, ...getQuotes().filter((x) => x.id !== q.id)]);
}
export function removeQuote(id: string): void {
  write("quotes", getQuotes().filter((q) => q.id !== id));
}

// ── Reader onboarding tutorial ──────────────────────────────────────────────
// Device-local UX flag (not synced). The reader shows the guided tour until the
// reader checks "skip tutorial next time".
export function getSkipReaderTutorial(): boolean {
  return read<boolean>("skipReaderTutorial", false);
}
export function setSkipReaderTutorial(skip: boolean): void {
  write("skipReaderTutorial", skip);
}

// ── Preferences ─────────────────────────────────────────────────────────────
export function getPreferences(): Preferences {
  return { ...DEFAULT_PREFERENCES, ...read<Partial<Preferences>>("preferences", {}) };
}
export function savePreferences(patch: Partial<Preferences>): Preferences {
  const next = { ...getPreferences(), ...patch, updatedAt: Date.now() };
  write("preferences", next);
  return next;
}

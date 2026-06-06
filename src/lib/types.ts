/**
 * Shared domain types for goread. These are the canonical shapes the whole app
 * speaks in — the Gutendex normaliser produces `Book`, the sync layer moves
 * `Bookmark`/`Highlight`/`ReadingProgress`, and the reader reads `Preferences`.
 */

export type ThemeName = "light" | "paper" | "sepia" | "dark" | "eink";

/** `system` resolves to light/dark via prefers-color-scheme. */
export type ThemePreference = ThemeName | "system";

export type ReaderFont =
  | "literata"
  | "garamond"
  | "libre-baskerville"
  | "inter"
  | "opendyslexic"
  | "publisher";

/** Standard reading or the magazine-style "editorial" treatment (drop cap,
 *  display chapter headings, refined measure). */
export type ReadingMode = "standard" | "editorial";

export interface Author {
  name: string;
  birthYear: number | null;
  deathYear: number | null;
}

/** A normalised Project Gutenberg book — our shape, not Gutendex's raw shape. */
export interface Book {
  id: number;
  title: string;
  authors: Author[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  summary: string | null;
  downloadCount: number;
  coverUrl: string | null;
  /** mime-type -> source URL, straight from Gutendex */
  formats: Record<string, string>;
  /** convenience: resolved EPUB url (proxied through our backend at read time) */
  epubUrl: string | null;
  /** convenience: resolved plain-text url */
  textUrl: string | null;
}

/** Furthest-position-wins. `percentage` is the renderer-agnostic 0..1 fallback. */
export interface ReadingProgress {
  bookId: number;
  cfi: string | null;
  percentage: number;
  locationLabel: string | null;
  deviceId: string | null;
  updatedAt: number;
}

export interface Bookmark {
  id: string;
  bookId: number;
  cfi: string | null;
  percentage: number;
  label: string | null;
  createdAt: number;
  updatedAt: number;
  /** tombstone for offline-safe deletes */
  deletedAt: number | null;
}

export interface Highlight {
  id: string;
  bookId: number;
  cfiRange: string;
  text: string;
  color: string;
  note: string | null;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface Preferences {
  theme: ThemePreference;
  readerFont: ReaderFont;
  /** percentage of base reading size, e.g. 100 = default */
  fontSizePct: number;
  lineHeight: number;
  /** horizontal margin as a percentage of the reader column */
  marginPct: number;
  /** continuous (infinite) scroll through the whole book vs. chapter-by-chapter */
  continuousScroll: boolean;
  /** auto-advance to the next chapter when you reach the end of one */
  autoAdvance: boolean;
  /** standard reading vs. the magazine-style editorial treatment */
  readingMode: ReadingMode;
  updatedAt: number;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: "system",
  readerFont: "literata",
  fontSizePct: 100,
  lineHeight: 1.6,
  marginPct: 6,
  continuousScroll: false,
  autoAdvance: false,
  readingMode: "standard",
  updatedAt: 0,
};

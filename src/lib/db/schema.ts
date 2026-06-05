import {
  pgTable,
  text,
  integer,
  real,
  bigint,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { Author } from "../types";

/** epoch-ms timestamp column helper (sync uses these as the LWW clock). */
const ts = (name: string) => bigint(name, { mode: "number" });

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user id
  email: text("email"),
  createdAt: ts("created_at").notNull(),
});

export const books = pgTable("books", {
  id: integer("id").primaryKey(), // Gutenberg id
  title: text("title").notNull(),
  authors: jsonb("authors").$type<Author[]>().notNull(),
  subjects: jsonb("subjects").$type<string[]>().notNull(),
  bookshelves: jsonb("bookshelves").$type<string[]>().notNull(),
  languages: jsonb("languages").$type<string[]>().notNull(),
  summary: text("summary"),
  downloadCount: integer("download_count").notNull().default(0),
  coverUrl: text("cover_url"),
  formats: jsonb("formats").$type<Record<string, string>>().notNull(),
  epubBlobUrl: text("epub_blob_url"),
  metadataFetchedAt: ts("metadata_fetched_at"),
});

export const shelves = pgTable("shelves", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: ts("created_at").notNull(),
  updatedAt: ts("updated_at").notNull(),
  deletedAt: ts("deleted_at"),
});

export const shelfBooks = pgTable(
  "shelf_books",
  {
    shelfId: text("shelf_id").notNull(),
    bookId: integer("book_id").notNull(),
    addedAt: ts("added_at").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.shelfId, t.bookId] })],
);

export const readingProgress = pgTable(
  "reading_progress",
  {
    userId: text("user_id").notNull(),
    bookId: integer("book_id").notNull(),
    cfi: text("cfi"),
    percentage: real("percentage").notNull().default(0),
    locationLabel: text("location_label"),
    deviceId: text("device_id"),
    updatedAt: ts("updated_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.bookId] })],
);

export const bookmarks = pgTable("bookmarks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  bookId: integer("book_id").notNull(),
  cfi: text("cfi"),
  percentage: real("percentage").notNull().default(0),
  label: text("label"),
  createdAt: ts("created_at").notNull(),
  updatedAt: ts("updated_at").notNull(),
  deletedAt: ts("deleted_at"),
});

export const highlights = pgTable("highlights", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  bookId: integer("book_id").notNull(),
  cfiRange: text("cfi_range").notNull(),
  text: text("text").notNull(),
  color: text("color").notNull(),
  note: text("note"),
  createdAt: ts("created_at").notNull(),
  updatedAt: ts("updated_at").notNull(),
  deletedAt: ts("deleted_at"),
});

export const preferences = pgTable("preferences", {
  userId: text("user_id").primaryKey(),
  theme: text("theme").notNull().default("system"),
  readerFont: text("reader_font").notNull().default("literata"),
  fontSizePct: integer("font_size_pct").notNull().default(100),
  lineHeight: real("line_height").notNull().default(1.6),
  marginPct: integer("margin_pct").notNull().default(6),
  readingDays: jsonb("reading_days").$type<string[]>().notNull().default([]),
  extra: jsonb("extra").$type<Record<string, unknown>>(),
  updatedAt: ts("updated_at").notNull(),
});

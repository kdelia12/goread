import { z } from "zod";

/**
 * Zod schemas guarding every external input. Routes call `parse()` and reject
 * anything that doesn't fit — no raw user input reaches Gutendex, the DB, or the
 * proxy without passing through here.
 */

export const themePreferenceSchema = z.enum([
  "system",
  "light",
  "paper",
  "sepia",
  "dark",
  "eink",
]);

export const readerFontSchema = z.enum([
  "literata",
  "libre-baskerville",
  "inter",
  "opendyslexic",
  "publisher",
]);

/** Path param: a Gutenberg book id. Coerced from string, must be a sane int. */
export const bookIdSchema = z.coerce.number().int().positive().max(10_000_000);

export const booksQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  topic: z.string().trim().max(100).optional(),
  languages: z
    .string()
    .regex(/^[a-z]{2}(,[a-z]{2})*$/i, "languages must be comma-separated ISO codes")
    .max(64)
    .optional(),
  sort: z.enum(["popular", "ascending", "descending"]).optional(),
  page: z.coerce.number().int().min(1).max(1000).optional(),
});
export type BooksQuery = z.infer<typeof booksQuerySchema>;

export const preferencesPatchSchema = z
  .object({
    theme: themePreferenceSchema,
    readerFont: readerFontSchema,
    fontSizePct: z.number().min(50).max(300),
    lineHeight: z.number().min(1).max(3),
    marginPct: z.number().min(0).max(40),
  })
  .partial();

const timestamp = z.number().int().nonnegative();

export const bookmarkInputSchema = z.object({
  id: z.string().min(1).max(64),
  bookId: z.number().int().positive(),
  cfi: z.string().max(2000).nullable(),
  percentage: z.number().min(0).max(1),
  label: z.string().max(500).nullable(),
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt: timestamp.nullable(),
});

export const highlightInputSchema = z.object({
  id: z.string().min(1).max(64),
  bookId: z.number().int().positive(),
  cfiRange: z.string().min(1).max(4000),
  text: z.string().max(20000),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .or(z.enum(["yellow", "green", "blue", "pink", "orange"])),
  note: z.string().max(20000).nullable(),
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt: timestamp.nullable(),
});

export const progressInputSchema = z.object({
  bookId: z.number().int().positive(),
  cfi: z.string().max(2000).nullable(),
  percentage: z.number().min(0).max(1),
  locationLabel: z.string().max(200).nullable(),
  deviceId: z.string().max(64).nullable(),
  updatedAt: timestamp,
});

export const syncPushSchema = z.object({
  bookmarks: z.array(bookmarkInputSchema).max(2000).optional(),
  highlights: z.array(highlightInputSchema).max(2000).optional(),
  progress: z.array(progressInputSchema).max(2000).optional(),
});
export type SyncPush = z.infer<typeof syncPushSchema>;

export const sinceCursorSchema = z.coerce.number().int().nonnegative();

/** Uniform parse helper for route handlers. */
export function parseInput<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { ok: true; data: T } | { ok: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  const first = result.error.issues[0];
  const path = first?.path.join(".") || "input";
  return { ok: false, error: `${path}: ${first?.message ?? "invalid"}` };
}

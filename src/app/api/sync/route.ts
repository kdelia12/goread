import { NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { getUserId } from "@/lib/auth";
import { sinceCursorSchema, syncPushSchema, parseInput } from "@/lib/security/validation";

export const runtime = "nodejs";

/** Delta pull: everything changed after ?since=<cursor>. */
export async function GET(req: Request) {
  const userId = await getUserId();
  const db = getDb();
  if (!userId || !db) {
    return NextResponse.json({ enabled: false, bookmarks: [], highlights: [], progress: [], cursor: 0 });
  }

  const sinceParam = new URL(req.url).searchParams.get("since") ?? "0";
  const since = parseInput(sinceCursorSchema, sinceParam);
  const cursor = since.ok ? since.data : 0;

  const [bookmarks, highlights, progress] = await Promise.all([
    db
      .select()
      .from(schema.bookmarks)
      .where(and(eq(schema.bookmarks.userId, userId), gt(schema.bookmarks.updatedAt, cursor))),
    db
      .select()
      .from(schema.highlights)
      .where(and(eq(schema.highlights.userId, userId), gt(schema.highlights.updatedAt, cursor))),
    db
      .select()
      .from(schema.readingProgress)
      .where(
        and(eq(schema.readingProgress.userId, userId), gt(schema.readingProgress.updatedAt, cursor)),
      ),
  ]);

  return NextResponse.json({ enabled: true, bookmarks, highlights, progress });
}

/** Push local changes; server upserts via last-write-wins on updatedAt. */
export async function POST(req: Request) {
  const userId = await getUserId();
  const db = getDb();
  if (!userId || !db) return NextResponse.json({ enabled: false });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseInput(syncPushSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { bookmarks = [], highlights = [], progress = [] } = parsed.data;

  await Promise.all([
    ...bookmarks.map((b) =>
      db
        .insert(schema.bookmarks)
        .values({ ...b, userId })
        .onConflictDoUpdate({
          target: schema.bookmarks.id,
          set: {
            cfi: b.cfi,
            percentage: b.percentage,
            label: b.label,
            updatedAt: b.updatedAt,
            deletedAt: b.deletedAt,
          },
        }),
    ),
    ...highlights.map((h) =>
      db
        .insert(schema.highlights)
        .values({ ...h, userId })
        .onConflictDoUpdate({
          target: schema.highlights.id,
          set: {
            cfiRange: h.cfiRange,
            text: h.text,
            color: h.color,
            note: h.note,
            updatedAt: h.updatedAt,
            deletedAt: h.deletedAt,
          },
        }),
    ),
    ...progress.map((p) =>
      db
        .insert(schema.readingProgress)
        .values({ ...p, userId })
        .onConflictDoUpdate({
          target: [schema.readingProgress.userId, schema.readingProgress.bookId],
          set: {
            cfi: p.cfi,
            percentage: p.percentage,
            locationLabel: p.locationLabel,
            updatedAt: p.updatedAt,
          },
        }),
    ),
  ]);

  return NextResponse.json({ ok: true });
}

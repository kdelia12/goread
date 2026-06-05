import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { getUserId } from "@/lib/auth";
import { preferencesPatchSchema, parseInput } from "@/lib/security/validation";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getUserId();
  const db = getDb();
  if (!userId || !db) return NextResponse.json({ enabled: false, preferences: null });

  const rows = await db
    .select()
    .from(schema.preferences)
    .where(eq(schema.preferences.userId, userId))
    .limit(1);
  return NextResponse.json({ enabled: true, preferences: rows[0] ?? null });
}

export async function PATCH(req: Request) {
  const userId = await getUserId();
  const db = getDb();
  if (!userId || !db) return NextResponse.json({ enabled: false });

  const body = await req.json().catch(() => null);
  const parsed = parseInput(preferencesPatchSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const now = Date.now();
  await db
    .insert(schema.preferences)
    .values({ userId, ...parsed.data, updatedAt: now })
    .onConflictDoUpdate({
      target: schema.preferences.userId,
      set: { ...parsed.data, updatedAt: now },
    });

  return NextResponse.json({ ok: true });
}

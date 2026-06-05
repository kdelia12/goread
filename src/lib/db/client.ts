import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * Lazy Neon/Drizzle client. Returns null when DATABASE_URL is absent, so every
 * persistence path can degrade to local-only without crashing. Uses the HTTP
 * driver — ideal for single-shot serverless queries.
 */
type Db = ReturnType<typeof drizzle<typeof schema>>;
let cached: Db | null = null;

export function isDbEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): Db | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!cached) {
    const sql = neon(url);
    cached = drizzle(sql, { schema });
  }
  return cached;
}

export { schema };

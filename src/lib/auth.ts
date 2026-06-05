/**
 * Auth gating. Clerk is entirely optional: with no keys the app runs in guest
 * mode (local-only data). `isAuthEnabled()` is the single switch the whole app
 * branches on, so nothing imports Clerk at render time unless it's configured.
 */
export function isAuthEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
}

/** Current Clerk user id, or null in guest mode. Server-only. */
export async function getUserId(): Promise<string | null> {
  if (!isAuthEnabled()) return null;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}

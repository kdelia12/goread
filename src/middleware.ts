import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Clerk middleware. Engaged only when Clerk is configured. `/stats` is a
 * members-only route — guests hitting it are redirected to sign-in.
 */
const authEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

const isProtectedRoute = createRouteMatcher(["/stats(.*)"]);

const handler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export default authEnabled ? handler : () => NextResponse.next();

export const config = {
  matcher: [
    // run on everything except static assets and files with an extension
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|map)$).*)",
    "/(api|trpc)(.*)",
  ],
};

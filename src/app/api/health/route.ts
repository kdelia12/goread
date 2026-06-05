import { NextResponse } from "next/server";
import { isAuthEnabled } from "@/lib/auth";
import { isDbEnabled } from "@/lib/db/client";

export const runtime = "nodejs";

/** Lightweight smoke endpoint — confirms the app is up and which modes are on. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "goread",
    authEnabled: isAuthEnabled(),
    dbEnabled: isDbEnabled(),
    fixtures: process.env.GOREAD_USE_FIXTURES === "1" || process.env.GOREAD_USE_FIXTURES === "true",
  });
}

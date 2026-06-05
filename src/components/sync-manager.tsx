"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { syncNow } from "@/lib/sync-client";

/**
 * Drives cross-device sync. Only mounted when Clerk is configured. Syncs once
 * on sign-in and again whenever the tab regains focus, so a device picks up
 * changes made elsewhere. All work is gated + best-effort inside syncNow().
 */
export function SyncManager() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    void syncNow();
    const onVisible = () => {
      if (document.visibilityState === "visible") void syncNow();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [isLoaded, isSignedIn]);

  return null;
}

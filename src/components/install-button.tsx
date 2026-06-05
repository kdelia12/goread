"use client";

import { useEffect, useState } from "react";
import { Download, Share, X, Plus } from "lucide-react";
import {
  detectPlatform,
  installAvailability,
  isStandalone,
  type Platform,
} from "@/lib/pwa";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [standalone, setStandalone] = useState(true);
  const [showIos, setShowIos] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const nav = navigator as Navigator & { standalone?: boolean };
    setPlatform(detectPlatform(nav.userAgent, nav.maxTouchPoints));
    setStandalone(
      isStandalone({
        displayModeStandalone: window.matchMedia("(display-mode: standalone)").matches,
        navigatorStandalone: nav.standalone,
      }),
    );
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setStandalone(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mounted) return null;
  const { canInstall, mode } = installAvailability({
    platform,
    standalone,
    hasNativePrompt: Boolean(deferred),
  });
  if (!canInstall) return null;

  async function install() {
    if (mode === "native" && deferred) {
      await deferred.prompt();
      await deferred.userChoice.catch(() => undefined);
      setDeferred(null);
    } else if (mode === "ios-instructions") {
      setShowIos(true);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={install} aria-label="Install goread">
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Install</span>
      </Button>

      {showIos ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Install goread"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={() => setShowIos(false)}
        >
          <div
            className="w-full max-w-sm rounded-[var(--radius)] border border-border bg-surface p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-fg">Add goread to your iPhone</h2>
              <button
                aria-label="Close"
                onClick={() => setShowIos(false)}
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius)] text-muted-fg hover:bg-surface-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ol className="mt-4 space-y-3 text-sm text-fg">
              <li className="flex items-center gap-3">
                <Share className="h-5 w-5 shrink-0 text-accent" />
                Tap the <strong>Share</strong> button in Safari.
              </li>
              <li className="flex items-center gap-3">
                <Plus className="h-5 w-5 shrink-0 text-accent" />
                Choose <strong>Add to Home Screen</strong>.
              </li>
              <li className="flex items-center gap-3">
                <Download className="h-5 w-5 shrink-0 text-accent" />
                Tap <strong>Add</strong> — goread joins your home screen.
              </li>
            </ol>
          </div>
        </div>
      ) : null}
    </>
  );
}

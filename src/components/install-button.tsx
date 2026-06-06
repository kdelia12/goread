"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  Share,
  X,
  Plus,
  MoreVertical,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  detectPlatform,
  detectDevice,
  installAvailability,
  isStandalone,
  type Platform,
  type Device,
} from "@/lib/pwa";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Step {
  icon: ReactNode;
  body: ReactNode;
}

/** Device-specific manual install steps + a clarifying footnote. */
function instructionsFor(device: Device): { steps: Step[]; note: ReactNode } {
  if (device === "android") {
    return {
      steps: [
        {
          icon: <MoreVertical className="h-5 w-5" />,
          body: (
            <>
              Open your browser <strong className="font-semibold text-fg">menu</strong> (⋮, top-right).
            </>
          ),
        },
        {
          icon: <Download className="h-5 w-5" />,
          body: (
            <>
              Tap <strong className="font-semibold text-fg">Install app</strong> (or{" "}
              <strong className="font-semibold text-fg">Add to Home screen</strong>).
            </>
          ),
        },
        {
          icon: <Check className="h-5 w-5" />,
          body: (
            <>
              Confirm — goread lands on your home screen.
            </>
          ),
        },
      ],
      note: (
        <>
          Works in <span className="font-medium text-fg">Chrome</span>,{" "}
          <span className="font-medium text-fg">Samsung Internet</span> and{" "}
          <span className="font-medium text-fg">Firefox</span>. The menu is the ⋮ icon near the
          address bar.
        </>
      ),
    };
  }

  // iPhone & iPad share the same flow; only the Share icon location differs.
  const shareWhere =
    device === "ipad" ? (
      <>
        the <span className="font-medium text-fg">top-right</span> of Safari
      </>
    ) : (
      <>
        the <span className="font-medium text-fg">bottom</span> of Safari
      </>
    );

  return {
    steps: [
      {
        icon: <Share className="h-5 w-5" />,
        body: (
          <>
            Tap the <strong className="font-semibold text-fg">Share</strong> icon in the Safari
            toolbar.
          </>
        ),
      },
      {
        icon: <Plus className="h-5 w-5" />,
        body: (
          <>
            Scroll down and choose{" "}
            <strong className="font-semibold text-fg">Add to Home Screen</strong>.
          </>
        ),
      },
      {
        icon: <Download className="h-5 w-5" />,
        body: (
          <>
            Tap <strong className="font-semibold text-fg">Add</strong> — goread lands on your home
            screen.
          </>
        ),
      },
    ],
    note: (
      <>
        The <span className="font-medium text-fg">Share</span> icon (a square with an arrow pointing
        up) sits at {shareWhere}. Only Safari can add to the Home Screen on iPhone &amp; iPad.
      </>
    ),
  };
}

export function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [device, setDevice] = useState<Device>("desktop");
  const [standalone, setStandalone] = useState(true);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const nav = navigator as Navigator & { standalone?: boolean };
    setPlatform(detectPlatform(nav.userAgent, nav.maxTouchPoints));
    setDevice(detectDevice(nav.userAgent, nav.maxTouchPoints));
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

  // Entrance animation + Escape to close + body scroll lock while the sheet is up.
  useEffect(() => {
    if (!open) {
      setShown(false);
      return;
    }
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

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
    } else {
      // ios-instructions | android-instructions
      setOpen(true);
    }
  }

  const { steps, note } = instructionsFor(device);
  // iPad & Android put their Share/menu button at the TOP-right; iPhone at the
  // bottom. Anchor the sheet to the same edge and point an arrow at the button.
  const atTop = device === "ipad" || device === "android";
  const pointerLabel = device === "android" ? "Menu" : "Share";

  const overlay = open ? (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-sheet-title"
      className={`fixed inset-0 z-[100] flex justify-center p-4 bg-black/55 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${
        atTop ? "items-start" : "items-end"
      } ${shown ? "opacity-100" : "opacity-0"}`}
      onClick={() => setOpen(false)}
    >
      {/* arrow that points at the real Safari/browser button */}
      <div
        className={`pointer-events-none absolute flex flex-col items-center gap-1 text-accent ${
          atTop ? "right-5 top-[max(0.5rem,env(safe-area-inset-top))]" : "bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2"
        } ${shown ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
      >
        {atTop ? (
          <>
            <ChevronUp className="h-7 w-7 animate-bounce" />
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white shadow-md">
              {pointerLabel} up here
            </span>
          </>
        ) : (
          <>
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white shadow-md">
              {pointerLabel} down here
            </span>
            <ChevronDown className="h-7 w-7 animate-bounce" />
          </>
        )}
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md transform-gpu rounded-3xl border border-border bg-surface px-5 pt-5 pb-6 shadow-2xl transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none ${
          atTop
            ? "mt-[calc(env(safe-area-inset-top)+3.25rem)]"
            : "mb-[calc(env(safe-area-inset-bottom)+3.25rem)]"
        } ${shown ? "translate-y-0" : atTop ? "-translate-y-3" : "translate-y-3"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-amber-600 shadow-sm">
              <span className="font-display text-2xl font-bold leading-none text-white">g</span>
            </div>
            <div>
              <h2
                id="install-sheet-title"
                className="font-display text-lg font-semibold leading-tight text-fg"
              >
                Add goread to your Home Screen
              </h2>
              <p className="mt-0.5 text-sm text-muted-fg">Reads like a real app. No App Store.</p>
            </div>
          </div>
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="-mr-1 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-fg transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ol className="mt-5 space-y-1">
          {steps.map((step, i) => (
            <li key={i} className="flex items-center gap-4 rounded-2xl px-1 py-2.5">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                {step.icon}
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white shadow-sm">
                  {i + 1}
                </span>
              </span>
              <p className="text-[15px] leading-snug text-muted-fg">{step.body}</p>
            </li>
          ))}
        </ol>

        <p className="mt-3 rounded-xl bg-surface-2 px-3.5 py-2.5 text-xs leading-relaxed text-muted-fg">
          {note}
        </p>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={install} aria-label="Install goread">
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Install</span>
      </Button>
      {overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}

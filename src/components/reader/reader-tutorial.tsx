"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  X,
  Palette,
  Type,
  Bookmark,
  Quote as QuoteIcon,
  ScrollText,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import { THEMES } from "@/lib/themes";

const INK = "#16130E";
const INK2 = "#211A10";
const CREAM = "#F3ECDE";
const MUTED = "#A89A85";
const GOLD = "#F0A92B";

interface Swatch {
  bg: string;
  fg: string;
  accent: string;
}

/** A tiny live "book page" that each step reconfigures — the interactive bit. */
function MockPage({
  swatch,
  dropCap,
  highlight,
  bookmark,
}: {
  swatch: Swatch;
  dropCap?: boolean;
  highlight?: boolean;
  bookmark?: boolean;
}) {
  return (
    <div
      className="relative mx-auto w-full max-w-[230px] overflow-hidden rounded-2xl border shadow-xl transition-colors duration-500"
      style={{ background: swatch.bg, borderColor: "rgba(243,236,222,0.12)" }}
    >
      <div className="px-5 pb-5 pt-4">
        <div
          className="font-display text-[15px] font-semibold transition-colors duration-500"
          style={{ color: swatch.fg }}
        >
          Chapter I
        </div>
        <div className="mt-2 space-y-1.5">
          <p
            className="text-[10px] leading-relaxed transition-colors duration-500"
            style={{ color: swatch.fg }}
          >
            {dropCap ? (
              <span
                className="float-left mr-1 font-display text-[30px] font-semibold leading-[0.8]"
                style={{ color: swatch.accent }}
              >
                I
              </span>
            ) : null}
            t is a truth universally acknowledged, that a single reader in
          </p>
          <p
            className="rounded text-[10px] leading-relaxed transition-colors duration-300"
            style={{
              color: highlight ? swatch.bg : swatch.fg,
              background: highlight ? swatch.accent : "transparent",
              padding: highlight ? "1px 4px" : 0,
            }}
          >
            possession of a good book must be in want of a quiet hour.
          </p>
          <p className="text-[10px] leading-relaxed" style={{ color: swatch.fg, opacity: 0.85 }}>
            However little known the feelings of such a reader may be,
          </p>
        </div>
      </div>
      {bookmark ? (
        <Bookmark
          className="absolute right-3 top-3 h-5 w-5"
          style={{ color: swatch.accent }}
          fill={swatch.accent}
        />
      ) : null}
      {highlight ? (
        <div
          className="absolute -right-1 bottom-3 flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold shadow-lg"
          style={{ background: GOLD, color: "#1A140C" }}
        >
          <QuoteIcon className="h-3 w-3" /> Story
        </div>
      ) : null}
    </div>
  );
}

function ThemeSwatches({
  active,
  onPick,
}: {
  active: number;
  onPick: (i: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-center gap-2.5">
      {THEMES.map((t, i) => (
        <button
          key={t.name}
          onClick={() => onPick(i)}
          aria-label={t.label}
          className="relative h-9 w-9 rounded-full border-2 transition-transform hover:scale-110"
          style={{
            background: t.swatch.bg,
            borderColor: i === active ? GOLD : "rgba(243,236,222,0.2)",
          }}
        >
          <span
            className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full"
            style={{ background: t.swatch.accent }}
          />
        </button>
      ))}
    </div>
  );
}

interface Step {
  key: string;
  icon: ReactNode;
  title: string;
  body: string;
  demo: (ctx: { swatch: Swatch; themeIdx: number; setThemeIdx: (i: number) => void }) => ReactNode;
}

export function ReaderTutorial({ onClose }: { onClose: (skip: boolean) => void }) {
  const [i, setI] = useState(0);
  const [skip, setSkip] = useState(false);
  const [entered, setEntered] = useState(false);
  const [themeIdx, setThemeIdx] = useState(2); // sepia — warm by default
  const touchX = useRef<number | null>(null);

  const swatch = THEMES[themeIdx].swatch;

  const steps: Step[] = [
    {
      key: "welcome",
      icon: <span className="font-display text-2xl font-bold">g</span>,
      title: "Welcome to goread",
      body: "70,000 timeless classics, beautiful to read. Here’s everything this reader can do — in about 20 seconds.",
      demo: () => <MockPage swatch={swatch} />,
    },
    {
      key: "themes",
      icon: <Palette className="h-6 w-6" />,
      title: "Five reading moods",
      body: "Daylight, Paper, Sepia, Midnight, E-ink. Tap a swatch to preview — switch any time from the palette in the top bar.",
      demo: ({ themeIdx, setThemeIdx }) => (
        <>
          <MockPage swatch={swatch} />
          <ThemeSwatches active={themeIdx} onPick={setThemeIdx} />
        </>
      ),
    },
    {
      key: "type",
      icon: <Type className="h-6 w-6" />,
      title: "Typography, your way",
      body: "Six typefaces, size, spacing and margins. Turn on Editorial mode for magazine-style drop caps and display headings.",
      demo: () => <MockPage swatch={swatch} dropCap />,
    },
    {
      key: "bookmarks",
      icon: <Bookmark className="h-6 w-6" />,
      title: "Never lose your place",
      body: "Bookmark any spot, and your progress + reading streak are saved automatically across every device.",
      demo: () => <MockPage swatch={swatch} bookmark />,
    },
    {
      key: "quotes",
      icon: <QuoteIcon className="h-6 w-6" />,
      title: "Turn lines into art",
      body: "Select any passage, tap Quote, and share a gorgeous Instagram-Story card of it in one tap.",
      demo: () => <MockPage swatch={swatch} highlight />,
    },
    {
      key: "flow",
      icon: <ScrollText className="h-6 w-6" />,
      title: "Read your way",
      body: "Chapter-by-chapter, infinite scroll, or auto-advance to the next chapter — all in Settings. That’s it. Enjoy.",
      demo: () => (
        <div className="flex items-center justify-center gap-3">
          <MockPage swatch={swatch} />
          <div className="flex flex-col items-center gap-1" style={{ color: GOLD }}>
            <Flame className="h-5 w-5" />
            <span className="text-[10px] font-semibold" style={{ color: MUTED }}>
              day 7
            </span>
          </div>
        </div>
      ),
    },
  ];

  const last = i === steps.length - 1;
  const step = steps[i];

  useEffect(() => {
    const r = requestAnimationFrame(() => setEntered(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(skip);
      else if (e.key === "ArrowRight") setI((p) => Math.min(steps.length - 1, p + 1));
      else if (e.key === "ArrowLeft") setI((p) => Math.max(0, p - 1));
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(r);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  function next() {
    if (last) onClose(skip);
    else setI((p) => p + 1);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="How the reader works"
      className={`fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md transition-opacity duration-300 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
      onClick={() => onClose(skip)}
    >
      <style>{`@keyframes goread-tut-in{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (dx < -45 && !last) setI((p) => p + 1);
          else if (dx > 45 && i > 0) setI((p) => p - 1);
          touchX.current = null;
        }}
        className={`relative w-full max-w-md overflow-hidden rounded-[26px] border shadow-2xl transition-all duration-300 ${
          entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
        style={{
          background: `linear-gradient(160deg, ${INK} 0%, ${INK2} 100%)`,
          borderColor: "rgba(240,169,43,0.18)",
        }}
      >
        {/* warm glow */}
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(240,169,43,0.18), transparent 70%)" }}
        />

        <button
          aria-label="Skip tour"
          onClick={() => onClose(skip)}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
          style={{ color: MUTED }}
        >
          <X className="h-5 w-5" />
        </button>

        {/* demo stage */}
        <div className="flex min-h-[210px] items-center justify-center px-6 pt-9 pb-2">
          <div key={i} style={{ animation: "goread-tut-in .45s cubic-bezier(.2,.7,.2,1) both" }}>
            {step.demo({ swatch, themeIdx, setThemeIdx })}
          </div>
        </div>

        <div className="px-7 pb-6 pt-3">
          {/* progress dots */}
          <div className="mb-4 flex items-center justify-center gap-1.5">
            {steps.map((s, idx) => (
              <button
                key={s.key}
                aria-label={`Go to step ${idx + 1}`}
                onClick={() => setI(idx)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: idx === i ? 22 : 6,
                  background: idx === i ? GOLD : "rgba(243,236,222,0.25)",
                }}
              />
            ))}
          </div>

          <div key={`t-${i}`} style={{ animation: "goread-tut-in .45s cubic-bezier(.2,.7,.2,1) both" }}>
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: "rgba(240,169,43,0.14)", color: GOLD }}
              >
                {step.icon}
              </span>
              <h2 className="font-display text-2xl font-bold leading-tight" style={{ color: CREAM }}>
                {step.title}
              </h2>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: MUTED }}>
              {step.body}
            </p>
          </div>

          {/* footer */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <label
              className="flex cursor-pointer select-none items-center gap-2 text-xs"
              style={{ color: MUTED }}
            >
              <span
                onClick={() => setSkip((v) => !v)}
                className="flex h-4 w-4 items-center justify-center rounded border transition-colors"
                style={{
                  borderColor: skip ? GOLD : "rgba(243,236,222,0.3)",
                  background: skip ? GOLD : "transparent",
                }}
              >
                {skip ? <Check className="h-3 w-3" style={{ color: "#1A140C" }} /> : null}
              </span>
              Don’t show again
            </label>

            <div className="flex items-center gap-2">
              {i > 0 ? (
                <button
                  onClick={() => setI((p) => p - 1)}
                  aria-label="Back"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                  style={{ color: CREAM }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              ) : null}
              <button
                onClick={next}
                className="inline-flex h-10 items-center gap-1 rounded-full px-5 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.03]"
                style={{ background: GOLD, color: "#1A140C" }}
              >
                {last ? "Start reading" : "Next"}
                {!last ? <ChevronRight className="h-4 w-4" /> : null}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

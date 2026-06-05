"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Palette, Check, Monitor } from "lucide-react";
import { THEMES } from "@/lib/themes";

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const active = mounted ? (theme === "system" ? resolvedTheme : theme) : undefined;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Change reading theme"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius)] text-muted-fg transition-colors hover:bg-surface-2 hover:text-fg"
      >
        <Palette className="h-5 w-5" />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-56 rounded-[var(--radius)] border border-border bg-surface p-1.5 shadow-2xl"
          >
            {THEMES.map((t) => (
              <button
                key={t.name}
                type="button"
                role="menuitemradio"
                aria-checked={active === t.name && theme !== "system"}
                onClick={() => {
                  setTheme(t.name);
                  setOpen(false);
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded px-2.5 py-2 text-left transition-colors hover:bg-surface-2"
              >
                <span
                  className="h-5 w-5 shrink-0 rounded-full border border-border-strong"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${t.swatch.bg} 0 50%, ${t.swatch.accent} 50% 100%)`,
                  }}
                  aria-hidden
                />
                <span className="flex-1">
                  <span className="block text-sm font-medium text-fg">{t.label}</span>
                  <span className="block text-xs text-muted-fg">{t.description}</span>
                </span>
                {active === t.name && theme !== "system" ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : null}
              </button>
            ))}
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              role="menuitemradio"
              aria-checked={theme === "system"}
              onClick={() => {
                setTheme("system");
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded px-2.5 py-2 text-left transition-colors hover:bg-surface-2"
            >
              <Monitor className="h-5 w-5 shrink-0 text-muted-fg" aria-hidden />
              <span className="flex-1 text-sm font-medium text-fg">Match system</span>
              {theme === "system" ? <Check className="h-4 w-4 text-accent" /> : null}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

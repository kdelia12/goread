"use client";

import Link from "next/link";
import { BookOpenText, Search } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { InstallButton } from "./install-button";
import { StreakBadge } from "./streak-badge";
import { AuthButtons } from "./auth-buttons";

export function SiteHeader({ authEnabled }: { authEnabled: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-fg"
        >
          <BookOpenText className="h-6 w-6 text-accent" aria-hidden />
          goread
        </Link>

        <nav className="ml-5 hidden items-center gap-1 sm:flex">
          <Link
            href="/search"
            className="rounded-[var(--radius)] px-3 py-1.5 text-sm text-muted-fg transition-colors hover:bg-surface-2 hover:text-fg"
          >
            Browse
          </Link>
          <Link
            href="/library"
            className="rounded-[var(--radius)] px-3 py-1.5 text-sm text-muted-fg transition-colors hover:bg-surface-2 hover:text-fg"
          >
            Library
          </Link>
          {authEnabled ? (
            <Link
              href="/stats"
              className="rounded-[var(--radius)] px-3 py-1.5 text-sm text-muted-fg transition-colors hover:bg-surface-2 hover:text-fg"
            >
              Stats
            </Link>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <StreakBadge />
          <Link
            href="/search"
            aria-label="Search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius)] text-muted-fg transition-colors hover:bg-surface-2 hover:text-fg sm:hidden"
          >
            <Search className="h-5 w-5" />
          </Link>
          <InstallButton />
          <ThemeSwitcher />
          {authEnabled ? <AuthButtons /> : null}
        </div>
      </div>
    </header>
  );
}

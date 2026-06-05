"use client";

import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Bookmark, Quote, Flame, CalendarDays } from "lucide-react";
import { getAllProgress, getLibrary, getQuotes, getReadingDays } from "@/lib/local-store";
import { computeReadingStats, type ReadingStats } from "@/lib/stats";
import { dayKey } from "@/lib/streak";

export function ReadingStatsDashboard() {
  const [stats, setStats] = useState<ReadingStats | null>(null);

  useEffect(() => {
    setStats(
      computeReadingStats({
        progress: getAllProgress(),
        libraryCount: getLibrary().length,
        quotes: getQuotes(),
        readingDays: getReadingDays(),
        todayKey: dayKey(Date.now(), new Date().getTimezoneOffset()),
      }),
    );
  }, []);

  if (!stats) return <div className="h-48" aria-hidden />;

  const cards = [
    { label: "Currently reading", value: stats.reading, icon: BookOpen },
    { label: "Finished", value: stats.finished, icon: CheckCircle2 },
    { label: "Saved", value: stats.saved, icon: Bookmark },
    { label: "Quotes", value: stats.quotes, icon: Quote },
    { label: "Current streak", value: `${stats.currentStreak}d`, icon: Flame },
    { label: "Longest streak", value: `${stats.longestStreak}d`, icon: Flame },
    { label: "Days read", value: stats.daysRead, icon: CalendarDays },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-[var(--radius)] border border-border bg-surface p-5">
          <c.icon className="h-5 w-5 text-accent" aria-hidden />
          <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-fg">{c.value}</p>
          <p className="text-sm text-muted-fg">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

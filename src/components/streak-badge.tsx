"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { getReadingDays } from "@/lib/local-store";
import { computeStreak, dayKey } from "@/lib/streak";

export function StreakBadge() {
  const [streak, setStreak] = useState<number | null>(null);

  useEffect(() => {
    const today = dayKey(Date.now(), new Date().getTimezoneOffset());
    setStreak(computeStreak(getReadingDays(), today).current);
  }, []);

  if (!streak) return null;

  return (
    <span
      title={`${streak}-day reading streak`}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-sm font-medium text-fg"
    >
      <Flame className="h-4 w-4 text-accent" aria-hidden />
      <span className="tabular-nums">{streak}</span>
      <span className="sr-only">day reading streak</span>
    </span>
  );
}

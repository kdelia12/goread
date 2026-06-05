"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecentBooks, getProgress, type BookStub } from "@/lib/local-store";
import { progressLabel } from "@/lib/reading-position";
import { displayTitle } from "@/lib/format";
import { BookCover } from "./book-cover";

interface Item {
  stub: BookStub;
  pct: number;
  label: string;
}

export function ContinueReading() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const list = getRecentBooks()
      .map((stub) => {
        const p = getProgress(stub.id);
        return { stub, pct: p?.percentage ?? 0, label: progressLabel(p) };
      })
      .filter((i) => i.pct > 0)
      .slice(0, 12);
    setItems(list);
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-fg sm:text-3xl">Continue reading</h2>
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 [scrollbar-width:none]">
        {items.map(({ stub, pct, label }) => (
          <Link
            key={stub.id}
            href={`/read/${stub.id}`}
            className="group w-32 shrink-0 snap-start sm:w-36 md:w-40"
          >
            <BookCover title={displayTitle(stub.title)} author={stub.author} coverUrl={stub.coverUrl} className="shadow-sm" />
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(pct * 100)}%` }} />
            </div>
            <h3 className="mt-1.5 line-clamp-1 font-display text-sm font-semibold text-fg group-hover:text-accent">
              {displayTitle(stub.title)}
            </h3>
            <p className="text-xs text-muted-fg">{label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

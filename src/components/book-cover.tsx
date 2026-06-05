"use client";

import { useState } from "react";
import { coverPaletteFor, coverInitials } from "@/lib/cover";
import { cn } from "@/lib/utils";

interface BookCoverProps {
  title: string;
  author?: string;
  coverUrl?: string | null;
  className?: string;
}

/**
 * Book cover with a generated literary fallback. We try the Gutenberg cover
 * image and, on error or when absent, render a deterministic gradient cover
 * with the title's initials — no broken-image icons, ever.
 */
export function BookCover({ title, author, coverUrl, className }: BookCoverProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(coverUrl) && !failed;
  const palette = coverPaletteFor(title);

  return (
    <div
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-[var(--radius)] border border-border bg-surface-2",
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl as string}
          alt={`Cover of ${title}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-between p-3 text-center"
          style={{
            backgroundImage: `linear-gradient(150deg, ${palette.from}, ${palette.to})`,
            color: palette.fg,
          }}
        >
          <span className="mt-2 font-display text-3xl font-semibold opacity-90">
            {coverInitials(title)}
          </span>
          <span className="font-display text-sm leading-tight line-clamp-4">{title}</span>
          {author ? (
            <span className="text-[10px] uppercase tracking-wide opacity-80 line-clamp-1">
              {author}
            </span>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}

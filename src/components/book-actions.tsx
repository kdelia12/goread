"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Bookmark, BookmarkCheck } from "lucide-react";
import { inLibrary, toggleLibrary } from "@/lib/local-store";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share/share-button";
import { coverPaletteFor, coverInitials } from "@/lib/cover";
import { bookCaption } from "@/lib/share/quotes";
import { displayTitle } from "@/lib/format";

export function BookActions({
  id,
  title,
  author,
}: {
  id: number;
  title: string;
  author: string;
}) {
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setSaved(inLibrary(id));
  }, [id]);

  const short = displayTitle(title);
  const spec = {
    kind: "book" as const,
    title: short,
    author,
    initials: coverInitials(short),
    palette: coverPaletteFor(title),
    coverUrl: `/api/books/${id}/cover`,
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={`/read/${id}`}
        className="inline-flex h-11 items-center gap-2 rounded-[var(--radius)] bg-accent px-6 text-sm font-medium text-accent-fg transition-[filter] hover:brightness-105"
      >
        <BookOpen className="h-4 w-4" /> Start reading
      </Link>
      <Button variant="outline" onClick={() => setSaved(toggleLibrary(id))}>
        {mounted && saved ? (
          <>
            <BookmarkCheck className="h-4 w-4 text-accent" /> Saved
          </>
        ) : (
          <>
            <Bookmark className="h-4 w-4" /> Save
          </>
        )}
      </Button>
      <ShareButton spec={spec} caption={bookCaption({ title: short, author })} filename={`goread-book-${id}.png`} />
    </div>
  );
}

import Link from "next/link";
import { GENRES } from "@/lib/genres";
import { cn } from "@/lib/utils";

export function GenreChips({ active }: { active?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {GENRES.map((g) => (
        <Link
          key={g.topic}
          href={`/search?topic=${encodeURIComponent(g.topic)}`}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
            active === g.topic
              ? "border-accent bg-accent-soft text-fg"
              : "border-border text-fg hover:border-accent hover:text-accent",
          )}
        >
          {g.label}
        </Link>
      ))}
    </div>
  );
}

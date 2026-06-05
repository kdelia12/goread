"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  defaultValue?: string;
  autoFocus?: boolean;
  placeholder?: string;
}

export function SearchBar({
  defaultValue = "",
  autoFocus = false,
  placeholder = "Search 70,000+ classics by title or author…",
}: SearchBarProps) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const value = q.trim();
        router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
      }}
      className="relative w-full"
    >
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg"
      />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        type="search"
        name="q"
        enterKeyHint="search"
        placeholder={placeholder}
        aria-label="Search books"
        className="h-11 w-full rounded-[var(--radius)] border border-border bg-surface pl-10 pr-4 text-sm text-fg shadow-sm outline-none transition-colors placeholder:text-muted-fg focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring/30"
      />
    </form>
  );
}

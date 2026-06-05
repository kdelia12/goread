/**
 * Deterministic fallback book covers. When a Gutenberg cover image is missing
 * or fails to load, we render a generated literary cover whose palette and
 * initials are derived purely from the title — same book, same cover, always.
 */

export interface CoverPalette {
  from: string;
  to: string;
  fg: string;
}

export const PALETTES: CoverPalette[] = [
  { from: "#7c2d12", to: "#b45309", fg: "#fdf4e7" }, // burnt amber
  { from: "#1e3a5f", to: "#3b6ea5", fg: "#eaf2fb" }, // ink blue
  { from: "#3f3f46", to: "#71717a", fg: "#f4f4f5" }, // slate
  { from: "#14532d", to: "#3f7d4f", fg: "#eaf6ee" }, // forest
  { from: "#4a1d3f", to: "#7c3a66", fg: "#f7ebf3" }, // plum
  { from: "#5b3a1a", to: "#92602e", fg: "#f6ecda" }, // leather
  { from: "#3b2f2f", to: "#6f5b5b", fg: "#f1eaea" }, // sepia ink
  { from: "#1f3d3a", to: "#3f7d77", fg: "#e7f3f1" }, // teal
];

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function coverPaletteFor(seed: string): CoverPalette {
  return PALETTES[hashString(seed) % PALETTES.length];
}

/** Up to two initials drawn from the significant words of a title. */
export function coverInitials(title: string): string {
  const words = title
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !/^(the|a|an|of|or|and)$/i.test(w));
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

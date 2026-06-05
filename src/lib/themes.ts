import type { ThemeName } from "./types";

/**
 * The five reading themes. Each entry drives both the theme picker UI (label,
 * description, swatch) and the `system` mapping. The actual colour tokens live
 * in globals.css under `[data-theme="..."]`; the swatch here just mirrors the
 * three headline colours so the picker can render without reading CSS.
 */
export interface ThemeMeta {
  name: ThemeName;
  label: string;
  description: string;
  swatch: { bg: string; fg: string; accent: string };
  isDark: boolean;
  /** which prefers-color-scheme bucket `system` should fall into */
  scheme: "light" | "dark";
}

export const THEMES: ThemeMeta[] = [
  {
    name: "light",
    label: "Daylight",
    description: "Warm white, crisp and bright",
    swatch: { bg: "#FCFBF8", fg: "#1C1917", accent: "#B45309" },
    isDark: false,
    scheme: "light",
  },
  {
    name: "paper",
    label: "Paper",
    description: "Soft ivory, gentle on the eyes",
    swatch: { bg: "#F3EAD6", fg: "#3B342A", accent: "#A1631F" },
    isDark: false,
    scheme: "light",
  },
  {
    name: "sepia",
    label: "Sepia",
    description: "Classic antique-page warmth",
    swatch: { bg: "#E7DAC0", fg: "#4A3B28", accent: "#8A5A23" },
    isDark: false,
    scheme: "light",
  },
  {
    name: "dark",
    label: "Midnight",
    description: "Warm charcoal for night reading",
    swatch: { bg: "#1A1714", fg: "#ECE7DD", accent: "#F59E0B" },
    isDark: true,
    scheme: "dark",
  },
  {
    name: "eink",
    label: "E-ink",
    description: "Pure black on white, maximum contrast",
    swatch: { bg: "#FFFFFF", fg: "#000000", accent: "#000000" },
    isDark: false,
    scheme: "light",
  },
];

export const THEME_NAMES: ThemeName[] = THEMES.map((t) => t.name);

export const DEFAULT_THEME: ThemeName = "light";

const THEME_BY_NAME = new Map(THEMES.map((t) => [t.name, t]));

export function getTheme(name: string): ThemeMeta | undefined {
  return THEME_BY_NAME.get(name as ThemeName);
}

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === "string" && THEME_BY_NAME.has(value as ThemeName);
}

/**
 * Resolve a stored preference (which may be `system`) into a concrete theme,
 * given the OS colour-scheme. Sepia/paper/eink can never come from `system`.
 */
export function resolveTheme(
  preference: string,
  prefersDark: boolean,
): ThemeName {
  if (preference === "system" || !isThemeName(preference)) {
    return prefersDark ? "dark" : "light";
  }
  return preference;
}

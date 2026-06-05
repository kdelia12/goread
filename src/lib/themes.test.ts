import { describe, it, expect } from "vitest";
import {
  THEMES,
  THEME_NAMES,
  DEFAULT_THEME,
  getTheme,
  isThemeName,
  resolveTheme,
} from "./themes";

describe("themes registry", () => {
  it("exposes exactly the five named reading themes", () => {
    expect(THEME_NAMES).toEqual(["light", "paper", "sepia", "dark", "eink"]);
  });

  it("has unique names", () => {
    expect(new Set(THEME_NAMES).size).toBe(THEME_NAMES.length);
  });

  it("gives every theme a label, description and full swatch", () => {
    for (const t of THEMES) {
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
      expect(t.swatch.bg).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(t.swatch.fg).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(t.swatch.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("only marks dark themes as dark scheme", () => {
    expect(getTheme("dark")?.isDark).toBe(true);
    expect(getTheme("dark")?.scheme).toBe("dark");
    for (const t of THEMES.filter((x) => x.name !== "dark")) {
      expect(t.isDark).toBe(false);
    }
  });

  it("has a valid default theme", () => {
    expect(isThemeName(DEFAULT_THEME)).toBe(true);
  });
});

describe("isThemeName", () => {
  it("accepts known themes and rejects everything else", () => {
    expect(isThemeName("sepia")).toBe(true);
    expect(isThemeName("system")).toBe(false);
    expect(isThemeName("")).toBe(false);
    expect(isThemeName(null)).toBe(false);
    expect(isThemeName(42)).toBe(false);
  });
});

describe("resolveTheme", () => {
  it("maps system to dark/light by OS preference", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });

  it("passes through an explicit theme regardless of OS", () => {
    expect(resolveTheme("sepia", true)).toBe("sepia");
    expect(resolveTheme("paper", false)).toBe("paper");
    expect(resolveTheme("eink", true)).toBe("eink");
  });

  it("falls back to OS preference for unknown values", () => {
    expect(resolveTheme("banana", true)).toBe("dark");
    expect(resolveTheme("banana", false)).toBe("light");
  });
});

import { describe, it, expect } from "vitest";
import { hashString, coverPaletteFor, coverInitials } from "./cover";

describe("hashString", () => {
  it("is deterministic and varies by input", () => {
    expect(hashString("abc")).toBe(hashString("abc"));
    expect(hashString("abc")).not.toBe(hashString("abd"));
  });
});

describe("coverPaletteFor", () => {
  it("returns a stable palette for the same seed", () => {
    expect(coverPaletteFor("Dracula")).toEqual(coverPaletteFor("Dracula"));
    const p = coverPaletteFor("Dracula");
    expect(p.from).toMatch(/^#[0-9a-f]{6}$/i);
    expect(p.fg).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("coverInitials", () => {
  it("draws initials from significant words, skipping articles", () => {
    expect(coverInitials("The Picture of Dorian Gray")).toBe("PD");
    expect(coverInitials("Frankenstein")).toBe("FR");
    expect(coverInitials("A Tale of Two Cities")).toBe("TT");
  });
  it("handles empty/odd titles", () => {
    expect(coverInitials("")).toBe("?");
    expect(coverInitials("!!!")).toBe("?");
  });
});

import { describe, it, expect } from "vitest";
import { STORY_WIDTH, STORY_HEIGHT, STORY_ASPECT } from "./dimensions";
import { wrapText, clampLines } from "./text";
import {
  quoteAttribution,
  quoteCaption,
  streakCaption,
  bookCaption,
  makeQuoteId,
  cleanQuoteText,
} from "./quotes";

describe("story dimensions (Instagram Story 9:16)", () => {
  it("is exactly 1080×1920 and never drifts", () => {
    expect(STORY_WIDTH).toBe(1080);
    expect(STORY_HEIGHT).toBe(1920);
  });
  it("is a perfect 9:16 portrait", () => {
    expect(STORY_ASPECT).toBeCloseTo(9 / 16, 10);
    expect(STORY_WIDTH / 9).toBe(STORY_HEIGHT / 16);
  });
});

describe("wrapText", () => {
  const byChar = (s: string) => s.length; // 1px per char

  it("greedily wraps to the width", () => {
    expect(wrapText("a b c d", 3, byChar)).toEqual(["a b", "c d"]);
  });
  it("keeps a word that is longer than the width on its own line", () => {
    expect(wrapText("hello supercalifragilistic world", 6, byChar)).toEqual([
      "hello",
      "supercalifragilistic",
      "world",
    ]);
  });
  it("preserves explicit newlines", () => {
    expect(wrapText("line one\nline two", 100, byChar)).toEqual(["line one", "line two"]);
  });
});

describe("clampLines", () => {
  it("returns lines untouched when within the cap", () => {
    expect(clampLines(["a", "b"], 3)).toEqual(["a", "b"]);
  });
  it("truncates with an ellipsis on the last kept line", () => {
    expect(clampLines(["one", "two", "three"], 2)).toEqual(["one", "two…"]);
  });
});

describe("quote formatting", () => {
  const q = { author: "Austen, Jane", bookTitle: "Pride and Prejudice", text: "  It is a truth   universally acknowledged  " };

  it("attributes with author and title", () => {
    expect(quoteAttribution(q)).toBe("— Austen, Jane, Pride and Prejudice");
  });
  it("drops a missing author", () => {
    expect(quoteAttribution({ author: "Unknown author", bookTitle: "Beowulf" })).toBe("— Beowulf");
  });
  it("builds a share caption", () => {
    expect(quoteCaption(q)).toContain("Pride and Prejudice");
    expect(quoteCaption(q)).toContain("goread");
  });
  it("builds streak and book captions", () => {
    expect(streakCaption(1)).toContain("1 day");
    expect(streakCaption(5)).toContain("5 days");
    expect(bookCaption({ title: "Dracula", author: "Stoker, Bram" })).toContain("Dracula");
  });
});

describe("quote ids and cleaning", () => {
  it("makes a deterministic id", () => {
    expect(makeQuoteId(1342, "hello", 1000)).toBe(makeQuoteId(1342, "hello", 1000));
    expect(makeQuoteId(1342, "hello", 1000)).not.toBe(makeQuoteId(1342, "world", 1000));
  });
  it("collapses whitespace in selected text", () => {
    expect(cleanQuoteText("  hello\n  world \t ")).toBe("hello world");
  });
});

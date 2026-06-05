import { describe, it, expect } from "vitest";
import { GENRES, genreLabel } from "./genres";

describe("GENRES", () => {
  it("offers a broad, non-empty set with unique topics", () => {
    expect(GENRES.length).toBeGreaterThanOrEqual(15);
    const topics = GENRES.map((g) => g.topic);
    expect(new Set(topics).size).toBe(topics.length);
    for (const g of GENRES) {
      expect(g.label.length).toBeGreaterThan(0);
      expect(g.topic).toBe(g.topic.toLowerCase());
    }
  });
});

describe("genreLabel", () => {
  it("maps a topic back to its label, case-insensitively", () => {
    expect(genreLabel("gothic")).toBe("Gothic");
    expect(genreLabel("DETECTIVE")).toBe("Mystery & Detective");
    expect(genreLabel("nope")).toBeUndefined();
  });
});

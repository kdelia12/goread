import { describe, it, expect } from "vitest";
import {
  isValidId,
  coverUrl,
  epubUrl,
  epubImagesUrl,
  textUrl,
  pickEpubUrl,
  pickTextUrl,
  pickCoverUrl,
} from "./gutenberg-mirror";

describe("isValidId", () => {
  it("accepts positive integers only", () => {
    expect(isValidId(1342)).toBe(true);
    expect(isValidId(0)).toBe(false);
    expect(isValidId(-1)).toBe(false);
    expect(isValidId(1.5)).toBe(false);
    expect(isValidId("1342")).toBe(false);
    expect(isValidId(null)).toBe(false);
  });
});

describe("canonical url builders", () => {
  it("builds cache urls for an id", () => {
    expect(coverUrl(1342)).toBe(
      "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg",
    );
    expect(coverUrl(1342, "small")).toBe(
      "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.small.jpg",
    );
    expect(epubUrl(84)).toBe(
      "https://www.gutenberg.org/cache/epub/84/pg84.epub",
    );
    expect(epubImagesUrl(84)).toBe(
      "https://www.gutenberg.org/cache/epub/84/pg84-images-3.epub",
    );
    expect(textUrl(84)).toBe(
      "https://www.gutenberg.org/cache/epub/84/pg84.txt",
    );
  });
});

const FORMATS = {
  "text/html": "https://www.gutenberg.org/ebooks/1342.html.images",
  "application/epub+zip": "https://www.gutenberg.org/ebooks/1342.epub3.images",
  "application/octet-stream": "https://www.gutenberg.org/cache/epub/1342/pg1342-h.zip",
  "image/jpeg": "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg",
  "text/plain; charset=utf-8": "https://www.gutenberg.org/ebooks/1342.txt.utf-8",
};

describe("format pickers", () => {
  it("prefers application/epub+zip for epub", () => {
    expect(pickEpubUrl(FORMATS)).toBe(
      "https://www.gutenberg.org/ebooks/1342.epub3.images",
    );
  });

  it("picks plain text and cover image", () => {
    expect(pickTextUrl(FORMATS)).toBe(
      "https://www.gutenberg.org/ebooks/1342.txt.utf-8",
    );
    expect(pickCoverUrl(FORMATS)).toBe(
      "https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg",
    );
  });

  it("returns null when a format is absent", () => {
    expect(pickEpubUrl({})).toBeNull();
    expect(pickTextUrl({ "image/jpeg": "x.jpg" })).toBeNull();
  });

  it("skips .zip bundles", () => {
    expect(
      pickEpubUrl({ "application/epub+zip": "https://x/pg1-h.zip" }),
    ).toBeNull();
  });
});

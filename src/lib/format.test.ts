import { describe, it, expect } from "vitest";
import { displayTitle, displayAuthorName } from "./format";

describe("displayTitle", () => {
  it("drops a '; Or, ...' alternate title", () => {
    expect(displayTitle("Frankenstein; Or, The Modern Prometheus")).toBe("Frankenstein");
  });
  it("keeps a normal title", () => {
    expect(displayTitle("Pride and Prejudice")).toBe("Pride and Prejudice");
  });
  it("drops a long ':' subtitle", () => {
    const t =
      "The Lock and Key Library: The Most Interesting Stories of All Nations: North Europe";
    expect(displayTitle(t)).toBe("The Lock and Key Library");
  });
  it("ellipsizes an over-long single title", () => {
    const t = "A".repeat(100);
    const out = displayTitle(t, 64);
    expect(out.length).toBeLessThanOrEqual(64);
    expect(out.endsWith("…")).toBe(true);
  });
});

describe("displayAuthorName", () => {
  it("flips Lastname, Firstname", () => {
    expect(displayAuthorName("Shelley, Mary Wollstonecraft")).toBe("Mary Wollstonecraft Shelley");
    expect(displayAuthorName("Dostoyevsky, Fyodor")).toBe("Fyodor Dostoyevsky");
  });
  it("leaves a single name alone", () => {
    expect(displayAuthorName("Homer")).toBe("Homer");
  });
  it("strips a bracketed role and trailing lifespan", () => {
    expect(displayAuthorName("Hawthorne, Julian, 1846-1934 [Editor]")).toBe("Julian Hawthorne");
  });
});

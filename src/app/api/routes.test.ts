import { describe, it, expect, beforeAll } from "vitest";

// Force fixtures so the route tests are deterministic and offline.
beforeAll(() => {
  process.env.GOREAD_USE_FIXTURES = "1";
});

import { GET as healthGET } from "./health/route";
import { GET as booksGET } from "./books/route";
import { GET as bookGET } from "./books/[id]/route";
import { GET as recGET } from "./recommendations/[id]/route";
import { GET as syncGET } from "./sync/route";
import { GET as prefsGET } from "./preferences/route";

const req = (url: string) => new Request(url);
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe("GET /api/health", () => {
  it("reports ok and guest mode (no keys)", async () => {
    const json = await (await healthGET()).json();
    expect(json.ok).toBe(true);
    expect(json.authEnabled).toBe(false);
    expect(json.dbEnabled).toBe(false);
  });
});

describe("GET /api/books", () => {
  it("returns search results", async () => {
    const res = await booksGET(req("http://localhost/api/books?search=austen"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.results[0].id).toBe(1342);
  });
  it("rejects invalid input with 400", async () => {
    expect((await booksGET(req("http://localhost/api/books?sort=evil"))).status).toBe(400);
    expect((await booksGET(req("http://localhost/api/books?page=0"))).status).toBe(400);
  });
});

describe("GET /api/books/[id]", () => {
  it("returns a known book", async () => {
    const json = await (await bookGET(req("http://x"), ctx("84"))).json();
    expect(json.title).toMatch(/Frankenstein/);
  });
  it("404s an unknown id and 400s a bad id", async () => {
    expect((await bookGET(req("http://x"), ctx("9999999"))).status).toBe(404);
    expect((await bookGET(req("http://x"), ctx("abc"))).status).toBe(400);
    expect((await bookGET(req("http://x"), ctx("-3"))).status).toBe(400);
  });
});

describe("GET /api/recommendations/[id]", () => {
  it("recommends related books for Frankenstein", async () => {
    const json = await (await recGET(req("http://x"), ctx("84"))).json();
    expect(Array.isArray(json.recommendations)).toBe(true);
    expect(json.recommendations.length).toBeGreaterThan(0);
    // gothic neighbours like Dracula should surface
    const ids = json.recommendations.map((r: { book: { id: number } }) => r.book.id);
    expect(ids).not.toContain(84); // never recommends the seed
  });
});

describe("guest-mode persistence endpoints", () => {
  it("/api/sync reports disabled without auth + db", async () => {
    const json = await (await syncGET(req("http://localhost/api/sync?since=0"))).json();
    expect(json.enabled).toBe(false);
    expect(json.bookmarks).toEqual([]);
  });
  it("/api/preferences reports disabled without auth + db", async () => {
    const json = await (await prefsGET()).json();
    expect(json.enabled).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { assertSafeUrl, isSafeUrl, isAllowedHost, UnsafeUrlError } from "./url-guard";

describe("isAllowedHost", () => {
  it("is case-insensitive and tolerates a trailing dot", () => {
    expect(isAllowedHost("WWW.Gutenberg.ORG")).toBe(true);
    expect(isAllowedHost("www.gutenberg.org.")).toBe(true);
    expect(isAllowedHost("evil.com")).toBe(false);
  });
});

describe("assertSafeUrl — allows", () => {
  it("permits https Gutenberg cache URLs", () => {
    expect(
      isSafeUrl("https://www.gutenberg.org/cache/epub/1342/pg1342.epub"),
    ).toBe(true);
    expect(isSafeUrl("HTTPS://WWW.GUTENBERG.ORG/cache/epub/84/pg84.epub")).toBe(true);
    expect(isSafeUrl("https://aleph.gutenberg.org/1/3/4/1342/1342.epub")).toBe(true);
  });
});

describe("assertSafeUrl — blocks SSRF vectors", () => {
  const blocked = [
    "http://www.gutenberg.org/cache/epub/1/pg1.epub", // not https
    "ftp://www.gutenberg.org/x", // wrong scheme
    "file:///etc/passwd",
    "https://evil.com/pg1342.epub", // other origin
    "https://www.gutenberg.org.evil.com/x", // suffix trick
    "https://evil.com/?u=www.gutenberg.org", // host is evil.com
    "https://localhost/x",
    "https://127.0.0.1/x",
    "https://[::1]/x",
    "https://169.254.169.254/latest/meta-data/", // cloud metadata
    "https://10.0.0.5/x",
    "https://192.168.1.10/x",
    "https://user:pass@www.gutenberg.org/x", // credentials
    "https://www.gutenberg.org:8080/x", // non-default port
    "https://gutenbеrg.org/x", // homograph (Cyrillic е) -> punycode, not allowed
    "not a url",
    "",
  ];

  it.each(blocked)("rejects %s", (url) => {
    expect(isSafeUrl(url)).toBe(false);
    expect(() => assertSafeUrl(url)).toThrow(UnsafeUrlError);
  });
});

describe("assertSafeUrl — return value", () => {
  it("returns a normalised URL object for a safe url", () => {
    const url = assertSafeUrl("https://www.gutenberg.org/cache/epub/1342/pg1342.epub");
    expect(url.hostname).toBe("www.gutenberg.org");
    expect(url.protocol).toBe("https:");
  });
});

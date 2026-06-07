import { describe, it, expect } from "vitest";
import { SECURITY_HEADERS, contentSecurityPolicy, allSecurityHeaders } from "./headers";

describe("SECURITY_HEADERS", () => {
  it("includes the core hardening headers", () => {
    expect(SECURITY_HEADERS["X-Content-Type-Options"]).toBe("nosniff");
    expect(SECURITY_HEADERS["X-Frame-Options"]).toBe("DENY");
    expect(SECURITY_HEADERS["Referrer-Policy"]).toBeDefined();
    expect(SECURITY_HEADERS["Strict-Transport-Security"]).toMatch(/max-age=\d+/);
  });
});

describe("contentSecurityPolicy", () => {
  it("locks down framing and object/base", () => {
    const csp = contentSecurityPolicy();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
  });

  it("only allows Gutenberg covers and Clerk for images", () => {
    expect(contentSecurityPolicy()).toContain(
      "img-src 'self' data: blob: https://www.gutenberg.org",
    );
  });

  it("allows the production Clerk domain so ClerkJS can load", () => {
    const csp = contentSecurityPolicy();
    expect(csp).toContain("https://clerk.goread.fun");
  });

  it("adds unsafe-eval only in dev", () => {
    expect(contentSecurityPolicy({ dev: true })).toContain("'unsafe-eval'");
    expect(contentSecurityPolicy({ dev: false })).not.toContain("'unsafe-eval'");
  });
});

describe("allSecurityHeaders", () => {
  it("merges the CSP in with the static headers", () => {
    const headers = allSecurityHeaders();
    expect(headers["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
  });
});

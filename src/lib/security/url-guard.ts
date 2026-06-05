/**
 * SSRF guard for the content proxy. The proxy fetches public-domain assets from
 * Project Gutenberg only. The allowlist is EXACT-host, which inherently rejects
 * IP literals, localhost, link-local cloud-metadata (169.254.169.254), and any
 * other origin. https-only, no credentials, no non-default ports.
 */

export const GUTENBERG_HOSTS: ReadonlySet<string> = new Set([
  "www.gutenberg.org",
  "gutenberg.org",
  "gutenberg.pglaf.org",
  "aleph.gutenberg.org",
  "aleph.pglaf.org",
  "gutenberg.readingroo.ms",
  "gutenberg.nabasny.com",
]);

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeUrlError";
  }
}

export function isAllowedHost(
  hostname: string,
  allowed: ReadonlySet<string> = GUTENBERG_HOSTS,
): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, ""); // strip FQDN trailing dot
  return allowed.has(host);
}

/** Validate and normalise a URL, or throw UnsafeUrlError. */
export function assertSafeUrl(
  raw: string,
  allowed: ReadonlySet<string> = GUTENBERG_HOSTS,
): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError("Malformed URL");
  }
  if (url.protocol !== "https:") {
    throw new UnsafeUrlError(`Disallowed protocol: ${url.protocol}`);
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError("Credentials in URL are not allowed");
  }
  if (url.port && url.port !== "443") {
    throw new UnsafeUrlError(`Disallowed port: ${url.port}`);
  }
  if (!isAllowedHost(url.hostname, allowed)) {
    throw new UnsafeUrlError(`Host not allowed: ${url.hostname}`);
  }
  return url;
}

export function isSafeUrl(raw: string, allowed?: ReadonlySet<string>): boolean {
  try {
    assertSafeUrl(raw, allowed);
    return true;
  } catch {
    return false;
  }
}

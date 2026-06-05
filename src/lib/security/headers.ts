/**
 * Security headers. Applied globally via next.config.ts `headers()`. The CSP is
 * tuned for Next.js + Clerk + Google Fonts + Gutenberg covers; reader book
 * content runs in a sandboxed iframe (see ReaderSurface) as defence-in-depth.
 */

export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  "X-DNS-Prefetch-Control": "off",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

export interface CspOptions {
  dev?: boolean;
}

export function contentSecurityPolicy(opts: CspOptions = {}): string {
  const scriptSrc = opts.dev
    ? "'self' 'unsafe-inline' 'unsafe-eval'"
    : "'self' 'unsafe-inline'";

  const directives: Record<string, string> = {
    "default-src": "'self'",
    "base-uri": "'self'",
    "object-src": "'none'",
    "frame-ancestors": "'none'",
    "form-action": "'self'",
    "script-src": `${scriptSrc} https://*.clerk.accounts.dev https://challenges.cloudflare.com`,
    "style-src": "'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src": "'self' https://fonts.gstatic.com data:",
    "img-src":
      "'self' data: blob: https://www.gutenberg.org https://*.clerk.com https://img.clerk.com",
    "connect-src":
      "'self' https://gutendex.com https://www.gutenberg.org https://*.clerk.accounts.dev wss://*.clerk.accounts.dev",
    "frame-src": "'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
    "worker-src": "'self' blob:",
    "manifest-src": "'self'",
    "upgrade-insecure-requests": "",
  };

  return Object.entries(directives)
    .map(([k, v]) => (v ? `${k} ${v}` : k))
    .join("; ");
}

export function allSecurityHeaders(opts?: CspOptions): Record<string, string> {
  return {
    ...SECURITY_HEADERS,
    "Content-Security-Policy": contentSecurityPolicy(opts),
  };
}

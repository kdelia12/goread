/**
 * Best-effort client key for per-IP rate limiting. Prefer `x-real-ip`, which
 * the hosting platform (e.g. Vercel) sets to the true client and overwrites on
 * every request, over the client-spoofable `x-forwarded-for`. This limiter is
 * defence-in-depth only; use a shared store (Upstash) keyed on the platform IP
 * for hard guarantees across instances.
 */
export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return "anon";
}

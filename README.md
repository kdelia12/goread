# goread

A calm, beautiful, PWA-first reader for the **70,000+ free public-domain books** of
[Project Gutenberg](https://www.gutenberg.org). Browse and search the classics, read EPUBs in the
browser with five reading themes and full typography control, keep bookmarks / progress / quotes,
build a reading streak, and share a quote or your streak as an Instagram-Story image — on phone,
tablet, or desktop.

> **Runs with zero configuration.** Out of the box goread is in *guest + fixtures* mode: a bundled
> set of real Gutenberg books, all data saved locally, no API keys required. Add keys to unlock the
> live catalogue, accounts, and cross-device sync.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

That's it — no credentials needed. Everything (browse, read, themes, bookmarks, quotes, streak,
share, install-to-home-screen) works in guest mode.

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm start` | Production build / serve |
| `npm run test` / `npm run test:run` | Vitest unit + integration suite |
| `npm run test:e2e` | Playwright browser smoke suite |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:generate` / `db:push` | Drizzle migrations (needs `DATABASE_URL`) |

---

## Going live (optional keys)

Copy `.env.example` → `.env.local` and fill in what you want. **None are required.**

| Variable | Unlocks | Where |
|---|---|---|
| `GOREAD_USE_FIXTURES` | `1` = bundled demo books (default in `.env.local`); remove to hit the live Gutendex API | — |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` | Google / Apple sign-in + sync | [dashboard.clerk.com](https://dashboard.clerk.com) |
| `DATABASE_URL` | Cross-device sync of bookmarks/progress/highlights | Neon (Vercel Marketplace) |
| `BLOB_READ_WRITE_TOKEN` | Caching EPUB files | Vercel Blob |

In Clerk's **development** instance, Google & Apple work with Clerk's shared OAuth credentials —
you do **not** need the paid Apple Developer Program just to try Apple sign-in.

---

## Features

- **Read** — EPUB rendering in a sandboxed iframe; chapter navigation, table of contents,
  font size / line-height / margins / typeface (incl. an OpenDyslexic option), and progress that
  restores where you left off.
- **5 reading themes** — Daylight, Paper, Sepia, Midnight, and a high-contrast E-ink mode, applied
  to both the app chrome and the book content. Respects `prefers-color-scheme` and
  `prefers-reduced-motion`.
- **Library** — save books, “continue reading”, reading streak, and saved quotes.
- **Discovery** — trending, curated mood/subject rails, and content-based “you might also like”
  recommendations from Gutenberg metadata.
- **Quotes & sharing** — save passages and export a pixel-perfect **1080×1920** Instagram-Story
  card for a quote, a book, or your streak (native share sheet on mobile, download elsewhere).
- **Install** — installable PWA with offline caching; a platform-aware install button (Android
  prompt / iOS “Add to Home Screen” guidance).

---

## Architecture

- **Next.js 16 App Router + React 19 + Tailwind v4**, deployed to Vercel.
- **Data** — all Gutenberg access goes through our backend (`/api/books*`), because gutenberg.org
  and Gutendex send no CORS headers and block bots. Metadata via [Gutendex](https://gutendex.com)
  with a bundled-fixture fallback; EPUB bytes streamed through an SSRF-guarded proxy.
- **Reader engine** — `jszip` unzips the EPUB, a dependency-free OPF parser builds the spine, each
  chapter is sanitized (DOMPurify) and rendered in a `sandbox`ed iframe with injected theme CSS.
- **Persistence** — guest data in `localStorage`; when signed in, mirrored to Neon Postgres via
  Drizzle with a last-write-wins delta-sync (`reading_progress` is furthest-position-wins).
- **Security** — SSRF allow-list on the proxy, Zod validation on every input, per-IP rate limiting,
  DOMPurify + iframe sandbox for book HTML, and a strict CSP + hardening headers (`src/lib/security/`).

```
src/
  app/            App Router pages + /api route handlers
  components/     UI (header, reader, share, book cards, …)
  lib/
    gutendex*.ts  catalogue client + normaliser (+ fixtures)
    recommend.ts  content-based recommendations
    epub/         OPF parser, EPUB loader, reader CSS
    share/        quote system + 1080×1920 story canvas
    security/     url-guard (SSRF), sanitize, validation, rate-limit, headers
    db/           Drizzle schema + lazy Neon client
    streak.ts · reading-position.ts · sync-merge.ts · themes.ts · pwa.ts
```

## Testing

- **Vitest** unit + integration covers the pure logic and security (normaliser, recommend, sync
  merge, streak, reading position, SSRF guard, sanitizer, validation, rate limiter, CSP, EPUB OPF
  parser, story dimensions/wrapping, themes, PWA detection).
- **Playwright** e2e smoke covers the rendered app (home, search, theme switch, book detail,
  reader shell, library).

```bash
npm run test:run && npm run typecheck && npm run build && npm run test:e2e
```

## Legal

Books are in the **U.S. public domain** via Project Gutenberg; readers elsewhere should check local
copyright. goread is an independent reader, not affiliated with Project Gutenberg, and does not use
the Project Gutenberg trademark on the reformatted texts it serves. See `/about` and `/privacy`.

## Notes / roadmap

- Add `public/fonts/OpenDyslexic-Regular.woff2` to activate the OpenDyslexic reading face.
- The reader uses a custom lightweight EPUB engine; swapping in Readium ts-toolkit behind the same
  interface is a planned upgrade. See `docs/FEATURES.md` for the full researched backlog.
- Next 16 prefers `proxy.ts` over `middleware.ts`; the Clerk middleware still uses the (working)
  `middleware.ts` convention.

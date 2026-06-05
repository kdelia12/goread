# goread — Design Spec (MVP)

> Status: self-approved in autonomous mode (user asleep, pre-authorized a full build to a
> passing test suite). Decisions confirmed by user before sleep: Auth = Clerk,
> Reader engine = Readium ts-toolkit, Target = Web/PWA first.

## 1. What we're building

**goread** is a PWA-first reader for Project Gutenberg's public-domain catalogue. Users browse
and search books, read them in the browser, switch reading themes, and (when signed in) keep
bookmarks, reading progress, and highlights synced across devices. Recommendations and discovery
help users find their next book.

## 2. Hard constraints discovered in research (drive the architecture)

1. **Gutenberg has no CORS and blocks bots.** `gutendex.com` and `gutenberg.org` send no
   `Access-Control-Allow-Origin`, and gutenberg.org IP-blocks automated access. → All Gutenberg
   access MUST go through our own backend (proxy + cache). The browser never touches Gutenberg.
2. **Public Gutendex has no SLA / 32-per-page.** → Cache normalized metadata in our DB; never a
   hard runtime dependency.
3. **Kindle can't run the web app.** → Out of MVP scope; future "Send to Kindle" = EPUB export.
4. **Credential-free buildability.** The app must run and pass its full test suite with NO
   external credentials, via mock/fixture + graceful-degradation fallbacks. Real keys only
   unlock live data.

## 3. Architecture (units with one clear purpose)

### Pure, I/O-free core (heavily unit-tested)
- `lib/gutendex-normalize.ts` — raw Gutendex JSON → our `Book` type. Pure.
- `lib/recommend.ts` — content-based scoring (weighted overlap of bookshelves > subjects >
  author, Jaccard, popularity tiebreak). Pure.
- `lib/sync-merge.ts` — delta-sync conflict resolution: per-field last-write-wins by
  `updatedAt`; `reading_progress` is furthest-position-wins. Pure.
- `lib/reading-position.ts` — clamp/compare percentage (0..1), pick furthest position,
  CFI presence helpers. Pure.
- `lib/themes.ts` — theme registry (light, dark, sepia/paper, eink) + token metadata. Pure.
- `lib/gutenberg-mirror.ts` — resolve canonical EPUB/cover URLs for a Gutenberg id. Pure.

### I/O layer
- `lib/gutendex.ts` — fetch + normalize from Gutendex, with fixture fallback
  (`GOREAD_USE_FIXTURES` / network failure → bundled fixtures).
- `lib/db/*` — Drizzle schema + lazy Neon client (`getDb()` returns null without `DATABASE_URL`).
- `lib/auth.ts` — Clerk helpers, gated by `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.

### API (Next.js Route Handlers — stable contract for any client)
- `GET /api/books` — browse/search (`search`, `topic`, `languages`, `sort`, `page`).
- `GET /api/books/:id` — single normalized book.
- `GET /api/books/:id/content` — proxy EPUB bytes (CORS-enabled to our origin).
- `GET /api/recommendations/:id` — content-based recs for a book.
- `GET /api/sync?since=` (pull) / `POST /api/sync` (push) — delta sync.
- `GET|PATCH /api/preferences` — user prefs (theme, typography).

### UI (App Router)
- `/` home (trending + curated rails), `/search`, `/book/:id` (detail + recs),
  `/read/:id` (reader), `/library` (shelves/bookmarks, auth).
- `components/reader/ReadiumReader.tsx` — client wrapper over `@readium/navigator`
  (dynamic import, `ssr:false`). `ReaderControls.tsx` — font size / theme / line-height.
- Theme: `next-themes` with `attribute="data-theme"`, themes `[light, dark, sepia, eink]`;
  two-layer CSS-variable tokens in `globals.css`, re-exposed via Tailwind v4 `@theme inline`.

### Graceful degradation matrix
| Missing | Behaviour |
|---|---|
| Clerk keys | Guest mode; progress/bookmarks in localStorage/IndexedDB; no sync |
| `DATABASE_URL` | `getDb()` → null; persistence no-ops; sync logic still unit-tested as pure fns |
| Blob token | `/content` streams from mirror on the fly, no caching |
| Network/Gutendex | Fixture catalogue (real PG books) |

## 4. Data model (Drizzle / Postgres)
`users`, `books` (cached metadata, PK = gutenberg id), `shelves`, `shelf_books`,
`reading_progress` (cfi + percentage, furthest-wins), `bookmarks`, `highlights`,
`preferences`. Each syncable table carries `updatedAt` + `deletedAt` (tombstone).

## 5. Testing strategy (the suite that must pass)
- **Vitest unit**: every pure module above (normalize, recommend, sync-merge,
  reading-position, themes, gutenberg-mirror).
- **Vitest integration**: API route handlers with `fetch` mocked (no network) — books,
  recommendations, sync, preferences, content proxy.
- **Component (jsdom + Testing Library)**: theme switcher sets `data-theme`; book card renders.
- **Smoke**: `next build` (typecheck + lint) green; Playwright smoke (home loads via fixtures,
  search works, theme switch) if browsers installable, else build is the smoke gate.
- The Readium reader component is validated by build/typecheck + smoke, not unit tests (needs a
  real browser/iframe); its testable logic lives in `ReaderControls`/`reading-position`.

## 6. Explicitly out of MVP scope (YAGNI)
Kindle/Send-to-Kindle, Capacitor/native, pgvector semantic recs, audiobooks, social features,
in-app purchase. All deferred; architecture leaves room for them.

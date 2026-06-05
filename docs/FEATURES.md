# goread — feature backlog

Synthesised from a benchmark of Kindle, Apple Books, Kobo, Libby, Readwise, StoryGraph, and Moon+
Reader. **Shipped** = in the current build. The rest is a prioritised roadmap.

## ✅ Shipped (MVP)

- **Reading**: EPUB rendering (sandboxed iframe), chapter nav + table of contents, font
  size / line-height / margins / typeface (incl. OpenDyslexic), **resume from last position**
  (furthest-position-wins).
- **Themes**: Daylight / Paper / Sepia / Midnight / E-ink, applied to chrome *and* book content;
  honours `prefers-color-scheme` + `prefers-reduced-motion`; WCAG-AA contrast.
- **Library**: save books, Continue Reading (home + library), reading **streak** (current + longest).
- **Discovery**: trending, curated mood/subject rails, content-based “you might also like”.
- **Quotes & sharing**: save passages; export a **1080×1920 Instagram-Story** image for a quote /
  book / streak via native share sheet or download.
- **PWA**: installable, offline service worker, platform-aware install (Android prompt + iOS
  Add-to-Home-Screen guidance, iPad detection).
- **Accounts (optional)**: Clerk (Google/Apple), Neon Postgres sync with LWW delta-sync, guest mode.
- **Security**: SSRF-guarded proxy (per-hop redirect validation), Zod validation, rate limiting,
  DOMPurify + iframe sandbox + inner CSP, hardening headers.

## 🔜 v1 — high value, medium effort

- **Reader**: paginated (page-flip) mode toggle, tap-to-define dictionary (proxy Free Dictionary
  API), in-book full-text search, footnote popovers, auto-scroll, brightness/warmth overlay,
  estimated time left, keyboard shortcuts, immersive/distraction-free mode.
- **Annotation**: multi-colour highlights anchored by CFI range, per-book notebook, export
  highlights to Markdown/CSV/Readwise, copy-with-citation.
- **Library**: reading status (want/reading/finished/DNF), star ratings, reading goals + a stats
  dashboard (time read, pace, calendar heatmap), sort/filter, history.
- **Discovery**: “readers also read” (co-occurrence from app bookmarks), browse by era/length,
  reading challenges, book-of-the-day.
- **Sync/PWA**: download-for-offline per book, background sync, storage-management UI,
  **Send to Kindle** (EPUB email), full data export/backup, Web Share target.
- **Accessibility/i18n**: full focus-trap on all modals, dictionary/translation, multi-language UI
  (next-intl), RTL support, reading non-English Gutenberg books.

## 🌱 Later — bigger lifts

- **Reader engine**: swap the custom jszip engine for **Readium ts-toolkit** behind the same
  interface (richer CFI, fixed-layout, better pagination).
- **TTS read-aloud** with word highlighting (Web Speech API → optional cloud voices).
- **Semantic search & recs**: embeddings + pgvector on Neon (“cozy victorian mysteries”).
- **Engagement**: web-push daily reminders, badges, monthly/yearly “your year in books” recap,
  finish-line celebrations, optional book clubs / shared reading.
- **Native**: Capacitor wrappers for the App Store / Play Store.
- **Bionic/speed reading, reading ruler, vertical CJK text, spaced-repetition flashcards.**

## Notes

- Full research (8 agents, competitor benchmarks, per-feature implementation notes) lives in the
  session workflow transcript; this file is the curated digest.
- Each feature was scored value/effort/phase against goread's actual stack (Next.js 16, React 19,
  Tailwind v4, Drizzle/Neon, Clerk).

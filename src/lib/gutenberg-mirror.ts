/**
 * Pure helpers for resolving canonical Project Gutenberg asset URLs and for
 * picking the best format out of a Gutendex `formats` map.
 *
 * NB: these are gutenberg.org URLs. They have NO CORS headers, so anything the
 * browser must `fetch()` (i.e. the EPUB bytes) has to go through our own
 * `/api/books/:id/content` proxy. Plain <img> covers are fine cross-origin.
 */

const CACHE_BASE = "https://www.gutenberg.org/cache/epub";

export function isValidId(id: unknown): id is number {
  return typeof id === "number" && Number.isInteger(id) && id > 0;
}

export function coverUrl(id: number, size: "small" | "medium" = "medium"): string {
  return `${CACHE_BASE}/${id}/pg${id}.cover.${size}.jpg`;
}

export function epubUrl(id: number): string {
  return `${CACHE_BASE}/${id}/pg${id}.epub`;
}

export function epubImagesUrl(id: number): string {
  return `${CACHE_BASE}/${id}/pg${id}-images-3.epub`;
}

export function textUrl(id: number): string {
  return `${CACHE_BASE}/${id}/pg${id}.txt`;
}

type Formats = Record<string, string>;

function pickByMime(formats: Formats, predicate: (mime: string) => boolean): string | null {
  for (const [mime, url] of Object.entries(formats ?? {})) {
    if (predicate(mime) && typeof url === "string" && url.length > 0) {
      // skip the .zip bundles — they are not directly usable
      if (url.endsWith(".zip")) continue;
      return url;
    }
  }
  return null;
}

export function pickEpubUrl(formats: Formats): string | null {
  return pickByMime(formats, (m) => m.startsWith("application/epub+zip"));
}

export function pickTextUrl(formats: Formats): string | null {
  return pickByMime(formats, (m) => m.startsWith("text/plain"));
}

export function pickCoverUrl(formats: Formats): string | null {
  return pickByMime(formats, (m) => m.startsWith("image/"));
}

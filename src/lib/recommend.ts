import type { Book } from "./types";

/**
 * Content-based recommendations from Gutenberg metadata alone — no ML, no
 * embeddings. Signal weighting reflects how curated each field is:
 *   bookshelves (human-curated PG collections) > author > subjects > language.
 */
export interface ScoredBook {
  book: Book;
  score: number;
  reasons: string[];
}

export interface RecommendOptions {
  limit?: number;
  excludeIds?: Iterable<number>;
}

const WEIGHT_SHELF = 3;
const WEIGHT_AUTHOR = 2;
const WEIGHT_SUBJECT = 1;
const WEIGHT_LANGUAGE = 0.5;

/** Library-of-Congress subject strings are noisy: split on " -- " and lowercase. */
export function normalizeSubjects(subjects: string[]): Set<string> {
  const out = new Set<string>();
  for (const raw of subjects ?? []) {
    for (const part of raw.split(" -- ")) {
      const cleaned = part.trim().toLowerCase();
      if (cleaned) out.add(cleaned);
    }
  }
  return out;
}

function lowerSet(values: string[]): Set<string> {
  return new Set((values ?? []).map((v) => v.trim().toLowerCase()).filter(Boolean));
}

function intersectionSize(a: Set<string>, b: Set<string>): number {
  let n = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const v of small) if (large.has(v)) n++;
  return n;
}

/** Similarity score plus the human-readable reasons behind it. */
export function scorePair(seed: Book, candidate: Book): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  const shelfOverlap = intersectionSize(
    lowerSet(seed.bookshelves),
    lowerSet(candidate.bookshelves),
  );
  const subjectOverlap = intersectionSize(
    normalizeSubjects(seed.subjects),
    normalizeSubjects(candidate.subjects),
  );
  const seedAuthors = lowerSet(seed.authors.map((a) => a.name));
  const sharedAuthor = candidate.authors.some((a) =>
    seedAuthors.has(a.name.trim().toLowerCase()),
  );
  const sharedLanguage = intersectionSize(lowerSet(seed.languages), lowerSet(candidate.languages)) > 0;

  let score =
    WEIGHT_SHELF * shelfOverlap +
    WEIGHT_SUBJECT * subjectOverlap +
    (sharedAuthor ? WEIGHT_AUTHOR : 0) +
    (sharedLanguage ? WEIGHT_LANGUAGE : 0);

  if (sharedAuthor) {
    const name = candidate.authors[0]?.name ?? "the same author";
    reasons.push(`By ${name}`);
  }
  if (shelfOverlap > 0) {
    const shelf = candidate.bookshelves.find((s) =>
      lowerSet(seed.bookshelves).has(s.trim().toLowerCase()),
    );
    if (shelf) reasons.push(`Also in ${shelf}`);
  }
  if (subjectOverlap > 0) reasons.push("Similar themes");

  // tiny popularity tiebreak so equally-similar books rank by readership
  score += Math.min(candidate.downloadCount, 1_000_000) * 1e-7;

  return { score, reasons };
}

export function recommend(
  seed: Book,
  candidates: Book[],
  options: RecommendOptions = {},
): ScoredBook[] {
  const limit = options.limit ?? 12;
  const exclude = new Set<number>(options.excludeIds ?? []);
  exclude.add(seed.id);

  const scored: ScoredBook[] = [];
  for (const candidate of candidates) {
    if (exclude.has(candidate.id)) continue;
    const { score, reasons } = scorePair(seed, candidate);
    if (score <= 0) continue;
    scored.push({ book: candidate, score, reasons });
  }

  scored.sort(
    (a, b) => b.score - a.score || b.book.downloadCount - a.book.downloadCount,
  );
  return scored.slice(0, limit);
}

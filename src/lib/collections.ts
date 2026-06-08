import { FIXTURE_CATALOGUE } from "./gutendex";
import { normalizeBook, type RawGutendexBook } from "./gutendex-normalize";
import { queryBooks } from "./book-query";
import type { Book } from "./types";

/**
 * Curated book line-ups for the SEO landing pages. Most are drawn straight from
 * the bundled FIXTURE_CATALOGUE; a handful of canonical works that aren't in
 * that hand-picked set — the Russian greats, the public-domain dystopias, a few
 * extra Victorians — are authored here as raw Gutendex records so every grid
 * stays full and completely build-safe (no network at build time; covers
 * resolve from the book id through the Gutenberg mirror, with a generated
 * fallback if an image 404s).
 *
 * Every id below was verified against the live Gutendex catalogue.
 */
const EXTRA_RAW: RawGutendexBook[] = [
  // ── Russian literature ────────────────────────────────────────────────────
  {
    id: 2600,
    title: "War and Peace",
    authors: [{ name: "Tolstoy, Leo", birth_year: 1828, death_year: 1910 }],
    subjects: ["Russia -- History -- 1801-1917 -- Fiction", "War stories", "Historical fiction"],
    bookshelves: ["Russian Literature"],
    languages: ["en"],
    download_count: 18420,
  },
  {
    id: 1399,
    title: "Anna Karenina",
    authors: [{ name: "Tolstoy, Leo", birth_year: 1828, death_year: 1910 }],
    subjects: ["Married women -- Fiction", "Adultery -- Fiction", "Russia -- Fiction"],
    bookshelves: ["Russian Literature"],
    languages: ["en"],
    download_count: 16110,
  },
  {
    id: 28054,
    title: "The Brothers Karamazov",
    authors: [{ name: "Dostoyevsky, Fyodor", birth_year: 1821, death_year: 1881 }],
    subjects: ["Fathers and sons -- Fiction", "Russia -- Fiction", "Psychological fiction"],
    bookshelves: ["Russian Literature"],
    languages: ["en"],
    download_count: 15230,
  },
  {
    id: 600,
    title: "Notes from the Underground",
    authors: [{ name: "Dostoyevsky, Fyodor", birth_year: 1821, death_year: 1881 }],
    subjects: ["Psychological fiction", "Alienation (Social psychology) -- Fiction"],
    bookshelves: ["Russian Literature"],
    languages: ["en"],
    download_count: 12880,
  },
  {
    id: 2638,
    title: "The Idiot",
    authors: [{ name: "Dostoyevsky, Fyodor", birth_year: 1821, death_year: 1881 }],
    subjects: ["Russia -- Fiction", "Psychological fiction"],
    bookshelves: ["Russian Literature"],
    languages: ["en"],
    download_count: 9740,
  },
  {
    id: 1081,
    title: "Dead Souls",
    authors: [{ name: "Gogol, Nikolai Vasilevich", birth_year: 1809, death_year: 1852 }],
    subjects: ["Satire", "Russia -- Social life and customs -- Fiction"],
    bookshelves: ["Russian Literature"],
    languages: ["en"],
    download_count: 7320,
  },
  {
    id: 30723,
    title: "Fathers and Sons",
    authors: [{ name: "Turgenev, Ivan Sergeevich", birth_year: 1818, death_year: 1883 }],
    subjects: ["Fathers and sons -- Fiction", "Nihilism -- Fiction", "Russia -- Fiction"],
    bookshelves: ["Russian Literature"],
    languages: ["en"],
    download_count: 6210,
  },

  // ── Dystopian & utopian visions (public domain) ───────────────────────────
  {
    id: 1164,
    title: "The Iron Heel",
    authors: [{ name: "London, Jack", birth_year: 1876, death_year: 1916 }],
    subjects: ["Dystopias", "Science fiction", "Oligarchy -- Fiction"],
    bookshelves: ["Science Fiction"],
    languages: ["en"],
    download_count: 5980,
  },
  {
    id: 624,
    title: "Looking Backward, 2000 to 1887",
    authors: [{ name: "Bellamy, Edward", birth_year: 1850, death_year: 1898 }],
    subjects: ["Utopias -- Fiction", "Science fiction", "Future life -- Fiction"],
    bookshelves: ["Science Fiction"],
    languages: ["en"],
    download_count: 6470,
  },
  {
    id: 32,
    title: "Herland",
    authors: [{ name: "Gilman, Charlotte Perkins", birth_year: 1860, death_year: 1935 }],
    subjects: ["Utopias -- Fiction", "Feminism -- Fiction", "Science fiction"],
    bookshelves: ["Science Fiction"],
    languages: ["en"],
    download_count: 7110,
  },
  {
    id: 1906,
    title: "Erewhon",
    authors: [{ name: "Butler, Samuel", birth_year: 1835, death_year: 1902 }],
    subjects: ["Utopias -- Fiction", "Satire", "Dystopias"],
    bookshelves: ["Science Fiction"],
    languages: ["en"],
    download_count: 4380,
  },
  {
    id: 1951,
    title: "The Coming Race",
    authors: [{ name: "Lytton, Edward Bulwer", birth_year: 1803, death_year: 1873 }],
    subjects: ["Science fiction", "Subterranean races -- Fiction", "Utopias -- Fiction"],
    bookshelves: ["Science Fiction"],
    languages: ["en"],
    download_count: 3520,
  },
  {
    id: 12163,
    title: "When the Sleeper Wakes",
    authors: [{ name: "Wells, H. G. (Herbert George)", birth_year: 1866, death_year: 1946 }],
    subjects: ["Science fiction", "Dystopias", "Future -- Fiction"],
    bookshelves: ["Science Fiction"],
    languages: ["en"],
    download_count: 4010,
  },

  // ── Extra Victorians (to deepen the Victorian + romance grids) ─────────────
  {
    id: 766,
    title: "David Copperfield",
    authors: [{ name: "Dickens, Charles", birth_year: 1812, death_year: 1870 }],
    subjects: ["Bildungsromans", "Orphans -- Fiction", "England -- Fiction"],
    bookshelves: ["Best Books Ever Listings"],
    languages: ["en"],
    download_count: 9120,
  },
  {
    id: 730,
    title: "Oliver Twist",
    authors: [{ name: "Dickens, Charles", birth_year: 1812, death_year: 1870 }],
    subjects: ["Orphans -- Fiction", "London (England) -- Fiction", "Crime -- Fiction"],
    bookshelves: ["Best Books Ever Listings"],
    languages: ["en"],
    download_count: 8990,
  },
  {
    id: 1023,
    title: "Bleak House",
    authors: [{ name: "Dickens, Charles", birth_year: 1812, death_year: 1870 }],
    subjects: ["England -- Fiction", "Legal stories", "Domestic fiction"],
    bookshelves: ["Best Books Ever Listings"],
    languages: ["en"],
    download_count: 5640,
  },
  {
    id: 145,
    title: "Middlemarch",
    authors: [{ name: "Eliot, George", birth_year: 1819, death_year: 1880 }],
    subjects: ["England -- Fiction", "Domestic fiction", "City and town life -- Fiction"],
    bookshelves: ["Best Books Ever Listings"],
    languages: ["en"],
    download_count: 8740,
  },
  {
    id: 599,
    title: "Vanity Fair",
    authors: [{ name: "Thackeray, William Makepeace", birth_year: 1811, death_year: 1863 }],
    subjects: ["Satire", "England -- Fiction", "Social classes -- Fiction"],
    bookshelves: ["Best Books Ever Listings"],
    languages: ["en"],
    download_count: 5210,
  },
  {
    id: 110,
    title: "Tess of the d'Urbervilles",
    authors: [{ name: "Hardy, Thomas", birth_year: 1840, death_year: 1928 }],
    subjects: ["Tragedy", "Women -- Fiction", "England -- Fiction", "Love stories"],
    bookshelves: ["Best Books Ever Listings"],
    languages: ["en"],
    download_count: 7860,
  },
  {
    id: 105,
    title: "Persuasion",
    authors: [{ name: "Austen, Jane", birth_year: 1775, death_year: 1817 }],
    subjects: ["Love stories", "Courtship -- Fiction", "England -- Fiction"],
    bookshelves: ["Best Books Ever Listings"],
    languages: ["en"],
    download_count: 8430,
  },

  // ── Gothic ────────────────────────────────────────────────────────────────
  {
    id: 696,
    title: "The Castle of Otranto",
    authors: [{ name: "Walpole, Horace", birth_year: 1717, death_year: 1797 }],
    subjects: ["Gothic fiction", "Horror tales", "Italy -- Fiction"],
    bookshelves: ["Gothic Fiction"],
    languages: ["en"],
    download_count: 3980,
  },
];

const EXTRA_BY_ID = new Map<number, Book>(
  EXTRA_RAW.map((raw) => [raw.id as number, normalizeBook(raw)]),
);
const FIXTURE_BY_ID = new Map<number, Book>(FIXTURE_CATALOGUE.map((b) => [b.id, b]));

/**
 * Resolve an ordered id list to Books, preferring the richer fixture record
 * (real download counts, summaries) and falling back to the authored extras.
 * Unknown ids are dropped, so a typo can never render a broken card.
 */
export function curate(ids: number[]): Book[] {
  return ids
    .map((id) => FIXTURE_BY_ID.get(id) ?? EXTRA_BY_ID.get(id))
    .filter((b): b is Book => Boolean(b));
}

// ── Named collections used by the landing pages ─────────────────────────────

export const GOTHIC_NOVELS = curate([84, 345, 174, 43, 768, 1260, 696]);

export const VICTORIAN_NOVELS = curate([98, 1400, 766, 730, 1023, 145, 599, 1260, 768, 110, 174, 1661]);

export const CLASSIC_ROMANCE = curate([1342, 158, 161, 105, 1260, 768, 110, 25344]);

export const RUSSIAN_LITERATURE = curate([2554, 2600, 1399, 28054, 600, 2638, 1081, 30723]);

export const DYSTOPIAN_CLASSICS = curate([35, 36, 1164, 624, 32, 1906, 1951, 12163]);

/** A general "greatest hits" grid for the comparison and feature pages. */
export const POPULAR_CLASSICS = queryBooks(FIXTURE_CATALOGUE, { sort: "popular" }).results.slice(0, 12);

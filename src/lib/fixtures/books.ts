import type { RawGutendexBook } from "../gutendex-normalize";

/**
 * A hand-picked slice of the real Project Gutenberg catalogue, in raw Gutendex
 * shape. This is what powers the app with ZERO credentials/network — browse,
 * search, recommendations and book detail all look real. In production the
 * Gutendex client hits the live API and only falls back here on failure.
 */
function fmt(id: number): Record<string, string> {
  return {
    "text/html": `https://www.gutenberg.org/ebooks/${id}.html.images`,
    "application/epub+zip": `https://www.gutenberg.org/ebooks/${id}.epub3.images`,
    "text/plain; charset=utf-8": `https://www.gutenberg.org/ebooks/${id}.txt.utf-8`,
    "image/jpeg": `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`,
  };
}

export const FIXTURE_BOOKS: RawGutendexBook[] = [
  {
    id: 1342,
    title: "Pride and Prejudice",
    authors: [{ name: "Austen, Jane", birth_year: 1775, death_year: 1817 }],
    subjects: [
      "Courtship -- Fiction",
      "England -- Fiction",
      "Love stories",
      "Sisters -- Fiction",
      "Social classes -- Fiction",
    ],
    bookshelves: ["Best Books Ever Listings", "Harvard Classics"],
    languages: ["en"],
    summaries: [
      "The romantic clash between the opinionated Elizabeth Bennet and the proud Mr Darcy — a witty comedy of manners in Regency England.",
    ],
    download_count: 54213,
    formats: fmt(1342),
  },
  {
    id: 84,
    title: "Frankenstein; Or, The Modern Prometheus",
    authors: [{ name: "Shelley, Mary Wollstonecraft", birth_year: 1797, death_year: 1851 }],
    subjects: [
      "Science fiction",
      "Horror tales",
      "Monsters -- Fiction",
      "Scientists -- Fiction",
      "Gothic fiction",
    ],
    bookshelves: ["Gothic Fiction", "Movie Books", "Best Books Ever Listings"],
    languages: ["en"],
    summaries: [
      "A young scientist creates a living being from dead matter, then recoils from his creation — the founding myth of science fiction.",
    ],
    download_count: 79234,
    formats: fmt(84),
  },
  {
    id: 11,
    title: "Alice's Adventures in Wonderland",
    authors: [{ name: "Carroll, Lewis", birth_year: 1832, death_year: 1898 }],
    subjects: [
      "Fantasy fiction",
      "Children's stories",
      "Alice (Fictitious character) -- Fiction",
    ],
    bookshelves: ["Children's Literature", "Best Books Ever Listings"],
    languages: ["en"],
    summaries: [
      "A curious girl tumbles down a rabbit-hole into a nonsensical world of talking creatures and shifting logic.",
    ],
    download_count: 41020,
    formats: fmt(11),
  },
  {
    id: 1661,
    title: "The Adventures of Sherlock Holmes",
    authors: [{ name: "Doyle, Arthur Conan", birth_year: 1859, death_year: 1930 }],
    subjects: [
      "Detective and mystery stories",
      "Holmes, Sherlock (Fictitious character) -- Fiction",
      "Private investigators -- England -- Fiction",
    ],
    bookshelves: ["Detective Fiction", "Best Books Ever Listings"],
    languages: ["en"],
    summaries: [
      "Twelve cases of the world's most famous consulting detective and his chronicler Dr Watson.",
    ],
    download_count: 38110,
    formats: fmt(1661),
  },
  {
    id: 345,
    title: "Dracula",
    authors: [{ name: "Stoker, Bram", birth_year: 1847, death_year: 1912 }],
    subjects: [
      "Horror tales",
      "Vampires -- Fiction",
      "Transylvania (Romania) -- Fiction",
      "Gothic fiction",
    ],
    bookshelves: ["Gothic Fiction", "Movie Books", "Horror"],
    languages: ["en"],
    summaries: [
      "Told through letters and diaries, the Count's migration to England and the band who hunt him.",
    ],
    download_count: 33540,
    formats: fmt(345),
  },
  {
    id: 98,
    title: "A Tale of Two Cities",
    authors: [{ name: "Dickens, Charles", birth_year: 1812, death_year: 1870 }],
    subjects: [
      "Historical fiction",
      "French Revolution, 1789-1799 -- Fiction",
      "London (England) -- Fiction",
      "Paris (France) -- Fiction",
    ],
    bookshelves: ["Best Books Ever Listings", "Historical Fiction"],
    languages: ["en"],
    summaries: [
      "Love and sacrifice set against the terror of the French Revolution. 'It was the best of times...'",
    ],
    download_count: 21770,
    formats: fmt(98),
  },
  {
    id: 1260,
    title: "Jane Eyre: An Autobiography",
    authors: [{ name: "Brontë, Charlotte", birth_year: 1816, death_year: 1855 }],
    subjects: [
      "Governesses -- Fiction",
      "Orphans -- Fiction",
      "Bildungsromans",
      "Love stories",
    ],
    bookshelves: ["Best Books Ever Listings", "Gothic Fiction"],
    languages: ["en"],
    summaries: [
      "An orphaned governess finds love and a terrible secret at Thornfield Hall.",
    ],
    download_count: 24990,
    formats: fmt(1260),
  },
  {
    id: 174,
    title: "The Picture of Dorian Gray",
    authors: [{ name: "Wilde, Oscar", birth_year: 1854, death_year: 1900 }],
    subjects: [
      "Gothic fiction",
      "Conduct of life -- Fiction",
      "London (England) -- Fiction",
      "Portraits -- Fiction",
    ],
    bookshelves: ["Gothic Fiction", "Best Books Ever Listings"],
    languages: ["en"],
    summaries: [
      "A beautiful young man stays youthful while his portrait bears the ravages of his corruption.",
    ],
    download_count: 28800,
    formats: fmt(174),
  },
  {
    id: 768,
    title: "Wuthering Heights",
    authors: [{ name: "Brontë, Emily", birth_year: 1818, death_year: 1848 }],
    subjects: [
      "Gothic fiction",
      "Love stories",
      "Yorkshire (England) -- Fiction",
      "Revenge -- Fiction",
    ],
    bookshelves: ["Gothic Fiction", "Best Books Ever Listings"],
    languages: ["en"],
    summaries: [
      "The doomed, destructive passion of Catherine and Heathcliff on the wild Yorkshire moors.",
    ],
    download_count: 19450,
    formats: fmt(768),
  },
  {
    id: 2701,
    title: "Moby Dick; Or, The Whale",
    authors: [{ name: "Melville, Herman", birth_year: 1819, death_year: 1891 }],
    subjects: [
      "Whaling -- Fiction",
      "Sea stories",
      "Ahab, Captain (Fictitious character) -- Fiction",
      "Adventure stories",
    ],
    bookshelves: ["Best Books Ever Listings", "Adventure"],
    languages: ["en"],
    summaries: [
      "Captain Ahab's monomaniacal hunt for the white whale that maimed him.",
    ],
    download_count: 22310,
    formats: fmt(2701),
  },
  {
    id: 2554,
    title: "Crime and Punishment",
    authors: [{ name: "Dostoyevsky, Fyodor", birth_year: 1821, death_year: 1881 }],
    subjects: [
      "Crime -- Fiction",
      "Psychological fiction",
      "Saint Petersburg (Russia) -- Fiction",
      "Guilt -- Fiction",
    ],
    bookshelves: ["Best Books Ever Listings", "Russian Literature"],
    languages: ["en"],
    summaries: [
      "A destitute student murders a pawnbroker, then unravels under the weight of his conscience.",
    ],
    download_count: 20180,
    formats: fmt(2554),
  },
  {
    id: 1232,
    title: "The Prince",
    authors: [{ name: "Machiavelli, Niccolò", birth_year: 1469, death_year: 1527 }],
    subjects: ["Political ethics", "Political science -- Early works to 1800", "State, The"],
    bookshelves: ["Philosophy", "Harvard Classics"],
    languages: ["en"],
    summaries: [
      "The most notorious treatise on power: how rulers gain, hold, and lose their states.",
    ],
    download_count: 16040,
    formats: fmt(1232),
  },
  {
    id: 74,
    title: "The Adventures of Tom Sawyer",
    authors: [{ name: "Twain, Mark", birth_year: 1835, death_year: 1910 }],
    subjects: [
      "Boys -- Fiction",
      "Mississippi River -- Fiction",
      "Adventure stories",
      "Bildungsromans",
    ],
    bookshelves: ["Children's Literature", "Adventure"],
    languages: ["en"],
    summaries: [
      "Mischief, treasure and a murder trial along the Mississippi with the irrepressible Tom.",
    ],
    download_count: 14220,
    formats: fmt(74),
  },
  {
    id: 5200,
    title: "Metamorphosis",
    authors: [{ name: "Kafka, Franz", birth_year: 1883, death_year: 1924 }],
    subjects: ["Psychological fiction", "Alienation (Social psychology) -- Fiction"],
    bookshelves: ["Best Books Ever Listings"],
    languages: ["en"],
    summaries: [
      "A travelling salesman wakes transformed into a monstrous insect, and his family slowly turns away.",
    ],
    download_count: 17760,
    formats: fmt(5200),
  },
];

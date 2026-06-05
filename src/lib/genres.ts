/**
 * Curated browse-by-genre entries. Each `topic` maps to the Gutendex `topic`
 * query (which matches across Library-of-Congress subjects AND the curated
 * Project Gutenberg bookshelves), so a chip click lands on a real result set.
 */
export interface Genre {
  label: string;
  topic: string;
}

export const GENRES: Genre[] = [
  { label: "Fiction", topic: "fiction" },
  { label: "Fantasy", topic: "fantasy" },
  { label: "Science Fiction", topic: "science fiction" },
  { label: "Horror", topic: "horror" },
  { label: "Gothic", topic: "gothic" },
  { label: "Mystery & Detective", topic: "detective" },
  { label: "Adventure", topic: "adventure" },
  { label: "Romance", topic: "love stories" },
  { label: "Historical", topic: "historical fiction" },
  { label: "Children’s", topic: "children" },
  { label: "Poetry", topic: "poetry" },
  { label: "Drama", topic: "drama" },
  { label: "Philosophy", topic: "philosophy" },
  { label: "Humor", topic: "humor" },
  { label: "Short Stories", topic: "short stories" },
  { label: "Fairy Tales", topic: "fairy tales" },
  { label: "Western", topic: "western" },
  { label: "Biography", topic: "biography" },
  { label: "Travel", topic: "travel" },
  { label: "Science", topic: "science" },
];

export function genreLabel(topic: string): string | undefined {
  return GENRES.find((g) => g.topic === topic.toLowerCase())?.label;
}

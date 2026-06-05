import { hashString } from "../cover";

/** A saved passage from a book. */
export interface Quote {
  id: string;
  bookId: number;
  bookTitle: string;
  author: string;
  text: string;
  note: string | null;
  createdAt: number;
}

export function quoteAttribution(q: Pick<Quote, "author" | "bookTitle">): string {
  const author = q.author?.trim();
  return author && author !== "Unknown author"
    ? `— ${author}, ${q.bookTitle}`
    : `— ${q.bookTitle}`;
}

/** Caption text for the native share sheet / clipboard. */
export function quoteCaption(q: Pick<Quote, "text" | "author" | "bookTitle">): string {
  return `“${q.text.trim()}”\n${quoteAttribution(q)}\n\nRead free on goread`;
}

export function streakCaption(currentStreak: number): string {
  const day = currentStreak === 1 ? "day" : "days";
  return `📖 ${currentStreak} ${day} reading streak on goread`;
}

export function bookCaption(b: { title: string; author: string }): string {
  const author = b.author?.trim();
  return author && author !== "Unknown author"
    ? `Reading “${b.title}” by ${author} on goread`
    : `Reading “${b.title}” on goread`;
}

/** Deterministic id for a captured quote (no Date/random in the pure layer). */
export function makeQuoteId(bookId: number, text: string, createdAt: number): string {
  return `q_${bookId}_${createdAt}_${hashString(text).toString(36)}`;
}

/** Normalise a raw text selection into a clean quote string. */
export function cleanQuoteText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

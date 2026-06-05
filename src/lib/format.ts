/**
 * Display formatting for titles and author names. The catalogue stores long
 * "Title; Or, Subtitle" titles and "Lastname, Firstname, 1800-1880 [Editor]"
 * author strings — these clean them up for cards, the hero, and share images.
 */

/** Trim a title to its main part: drop "; Or, ..." alt-titles and long subtitles. */
export function displayTitle(title: string, max = 64): string {
  let t = (title ?? "").split(";")[0].trim();
  if (t.length < 2) t = (title ?? "").trim();
  t = t.replace(/\s+/g, " ");
  if (t.length > max && t.includes(":")) t = t.split(":")[0].trim();
  if (t.length > max) t = `${t.slice(0, max - 1).trimEnd()}…`;
  return t;
}

/** "Shelley, Mary Wollstonecraft, 1797-1851 [Editor]" -> "Mary Wollstonecraft Shelley". */
export function displayAuthorName(name: string): string {
  let cleaned = (name ?? "").replace(/\s*\[[^\]]*\]\s*/g, " ").trim();
  cleaned = cleaned.replace(/,\s*-?\d{1,4}\??\s*-\s*-?\d{0,4}\??\s*$/, "").trim();
  const comma = cleaned.indexOf(", ");
  if (comma > 0 && cleaned.indexOf(", ", comma + 1) === -1) {
    const last = cleaned.slice(0, comma).trim();
    const first = cleaned.slice(comma + 2).trim();
    if (first && last) return `${first} ${last}`;
  }
  return cleaned;
}

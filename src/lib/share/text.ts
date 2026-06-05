/**
 * Pure text-wrapping for canvas rendering. The caller injects a `measure`
 * function (ctx.measureText().width in the browser), so wrapping is fully
 * testable without a real canvas.
 */
export type Measure = (text: string) => number;

/** Greedy word-wrap honouring explicit newlines. */
export function wrapText(text: string, maxWidth: number, measure: Measure): string[] {
  const out: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      out.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && measure(candidate) > maxWidth) {
        out.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    out.push(line);
  }
  return out;
}

/** Cap the number of lines, adding an ellipsis to the last kept line. */
export function clampLines(lines: string[], maxLines: number): string[] {
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  const last = kept[maxLines - 1].replace(/[\s.,;:!?]+$/, "");
  kept[maxLines - 1] = `${last}…`;
  return kept;
}

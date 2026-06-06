import type { ReaderFont, ReadingMode } from "../types";

/**
 * Font stacks for the reading surface. Book text now renders inline in the
 * page, so we can use the app's loaded webfonts (with web-safe fallbacks for
 * offline / before they hydrate).
 */
export const READER_FONT_STACKS: Record<ReaderFont, string | null> = {
  literata: "var(--font-literata), Georgia, 'Iowan Old Style', 'Times New Roman', serif",
  garamond: "var(--font-eb-garamond), 'EB Garamond', Georgia, serif",
  "libre-baskerville": "'Libre Baskerville', Baskerville, 'Baskerville Old Face', Georgia, serif",
  inter: "var(--font-inter), system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  opendyslexic: "'OpenDyslexic', Georgia, serif",
  publisher: null, // leave the book's own element defaults untouched
};

export interface ReaderTheme {
  bg: string;
  fg: string;
  link: string;
  selection: string;
}

export interface ReaderTypography {
  font: ReaderFont;
  fontSizePct: number;
  lineHeight: number;
  marginPct: number;
  mode: ReadingMode;
}

const ROOT = ".goread-reader";

/**
 * Build the stylesheet for the inline reading surface. Every rule is scoped to
 * `.goread-reader` so it can't leak into the app chrome, and it re-establishes
 * element styling (headings, lists, blockquotes) that the app's CSS reset
 * would otherwise flatten. Pure → easy to unit test.
 */
export function buildScopedReaderCss(theme: ReaderTheme, typo: ReaderTypography): string {
  const stack = READER_FONT_STACKS[typo.font];
  const fontRule = stack ? `font-family:${stack};` : "";
  const basePx = Math.round(20 * (typo.fontSizePct / 100));
  const editorial = typo.mode === "editorial";

  const rules: string[] = [
    "@font-face{font-family:'OpenDyslexic';src:url('/fonts/OpenDyslexic-Regular.woff2') format('woff2');font-display:swap;}",
    `${ROOT}{${fontRule}font-size:${basePx}px;line-height:${typo.lineHeight};color:${theme.fg};` +
      `padding:28px ${typo.marginPct}% 160px;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;` +
      `overflow-wrap:break-word;-webkit-user-select:text;user-select:text;}`,
    `${ROOT} *{box-sizing:border-box;}`,
    `${ROOT} ::selection{background:${theme.selection};}`,
    `${ROOT} img{max-width:100%;height:auto;display:block;margin:1.4em auto;border-radius:2px;}`,
    // links are neutralised — render as plain text
    `${ROOT} a,${ROOT} a[data-link-disabled]{color:inherit;text-decoration:none;cursor:text;pointer-events:none;}`,
    `${ROOT} p{margin:0 0 1em;text-align:justify;hyphens:auto;}`,
    `${ROOT} blockquote{margin:1.2em 1.6em;font-style:italic;opacity:.9;border-left:2px solid currentColor;padding-left:1em;}`,
    `${ROOT} ul,${ROOT} ol{margin:0 0 1em;padding-left:1.6em;}`,
    `${ROOT} li{margin:0 0 .4em;}`,
    `${ROOT} h1{font-size:1.9em;line-height:1.2;margin:1.4em 0 .6em;font-weight:700;}`,
    `${ROOT} h2{font-size:1.5em;line-height:1.25;margin:1.3em 0 .5em;font-weight:700;}`,
    `${ROOT} h3{font-size:1.25em;line-height:1.3;margin:1.2em 0 .4em;font-weight:600;}`,
    `${ROOT} h4{font-size:1.1em;margin:1em 0 .4em;font-weight:600;}`,
    `${ROOT} hr{border:none;border-top:1px solid currentColor;opacity:.18;margin:2.4em 0;}`,
    `${ROOT} hr.goread-chsep{margin:4em 0;opacity:.14;}`,
    `${ROOT} section[data-ch]{scroll-margin-top:1rem;}`,
    `${ROOT} em,${ROOT} i{font-style:italic;}`,
    `${ROOT} strong,${ROOT} b{font-weight:700;}`,
    `${ROOT} sup{font-size:.7em;}`,
  ];

  if (editorial) {
    rules.push(
      // refined measure + display chapter headings + a drop cap to open each chapter
      `${ROOT}[data-mode="editorial"]{max-width:38rem;margin-left:auto;margin-right:auto;letter-spacing:.002em;}`,
      `${ROOT}[data-mode="editorial"] h1,${ROOT}[data-mode="editorial"] h2{font-family:var(--font-cormorant),Georgia,serif;font-weight:600;letter-spacing:.01em;text-align:center;}`,
      `${ROOT}[data-mode="editorial"] h1{font-size:2.4em;}`,
      `${ROOT}[data-mode="editorial"] > p:first-of-type::first-letter,` +
        `${ROOT}[data-mode="editorial"] section[data-ch] > p:first-of-type::first-letter{` +
        `font-family:var(--font-cormorant),Georgia,serif;float:left;font-size:3.4em;line-height:.82;` +
        `padding:.05em .08em 0 0;font-weight:600;color:var(--reader-link,currentColor);}`,
      `${ROOT}[data-mode="editorial"] p{margin-bottom:0;text-indent:1.3em;}`,
      `${ROOT}[data-mode="editorial"] p:first-of-type{text-indent:0;}`,
      `${ROOT}[data-mode="editorial"] h1+p,${ROOT}[data-mode="editorial"] h2+p,${ROOT}[data-mode="editorial"] h3+p{text-indent:0;}`,
      `${ROOT}[data-mode="editorial"] blockquote{text-align:left;}`,
    );
  }

  rules.push("@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto !important;}}");
  return rules.join("\n");
}

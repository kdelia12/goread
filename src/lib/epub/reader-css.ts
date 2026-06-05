import type { ReaderFont } from "../types";

/** Web-safe font stacks for the reading iframe (guaranteed to render offline). */
export const READER_FONT_STACKS: Record<ReaderFont, string | null> = {
  literata: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
  "libre-baskerville": "Baskerville, 'Baskerville Old Face', Georgia, serif",
  inter: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  opendyslexic: "'OpenDyslexic', Georgia, serif",
  publisher: null, // leave the book's own fonts untouched
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
}

/** Build the stylesheet injected into the sandboxed reading iframe. Pure. */
export function buildReaderCss(theme: ReaderTheme, typo: ReaderTypography): string {
  const stack = READER_FONT_STACKS[typo.font];
  const fontRule = stack ? `font-family:${stack};` : "";
  const basePx = Math.round(20 * (typo.fontSizePct / 100));

  return [
    "@font-face{font-family:'OpenDyslexic';src:url('/fonts/OpenDyslexic-Regular.woff2') format('woff2');font-display:swap;}",
    "*{box-sizing:border-box;}",
    `html{font-size:${basePx}px;}`,
    `body{margin:0;${fontRule}line-height:${typo.lineHeight};background:${theme.bg};color:${theme.fg};` +
      `padding:28px ${typo.marginPct}% 120px;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-wrap:break-word;}`,
    "img{max-width:100%;height:auto;display:block;margin:1em auto;}",
    // links are neutralised in the reader — render them as plain text
    "a,a[data-link-disabled]{color:inherit;text-decoration:none;cursor:text;pointer-events:none;}",
    "hr.goread-chsep{border:none;border-top:1px solid currentColor;opacity:.15;margin:3.5em 0;}",
    "section[data-ch]{scroll-margin-top:1rem;}",
    `::selection{background:${theme.selection};}`,
    "p{margin:0 0 1em;text-align:justify;hyphens:auto;}",
    "blockquote{margin:1em 1.5em;font-style:italic;opacity:.9;}",
    `h1,h2,h3,h4{line-height:1.25;${fontRule}}`,
    "hr{border:none;border-top:1px solid currentColor;opacity:.2;margin:2em 0;}",
    "@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto !important;}}",
  ].join("\n");
}

/**
 * Wrap chapter body HTML into a full document. An inner CSP is the third layer
 * (after DOMPurify and the iframe `sandbox`): it forbids scripts, network
 * connections, and form submission outright, so injected book HTML can do
 * nothing even if the sanitizer were bypassed. Images/fonts/inline styles only.
 */
export function buildReaderDocument(css: string, bodyHtml: string): string {
  const csp =
    "default-src 'none'; img-src 'self' blob: data: https:; style-src 'unsafe-inline'; font-src 'self' https: data:; form-action 'none'; base-uri 'none'";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style></head><body>${bodyHtml}</body></html>`;
}

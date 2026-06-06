import { describe, it, expect } from "vitest";
import { buildScopedReaderCss, READER_FONT_STACKS } from "./reader-css";

const base = { fontSizePct: 100, lineHeight: 1.6, marginPct: 6, mode: "standard" as const };

describe("buildScopedReaderCss", () => {
  it("scopes every rule to .goread-reader and drives colour from theme CSS vars", () => {
    const css = buildScopedReaderCss({ ...base, font: "literata" });
    expect(css).toContain(".goread-reader{");
    expect(css).toContain("color:var(--reader-fg,#26211b)");
    expect(css).toContain("background:var(--reader-bg,#fbfaf6)");
    expect(css).toContain("line-height:1.6");
    expect(css).toContain("padding:28px 6%");
    expect(css).toContain("font-size:20px"); // 20 * 100%
    expect(css).toContain(READER_FONT_STACKS.literata as string);
    expect(css).toContain(".goread-reader ::selection{background:var(--reader-selection");
  });

  it("scales the base font size with the percentage", () => {
    expect(buildScopedReaderCss({ ...base, font: "inter", fontSizePct: 150 })).toContain(
      "font-size:30px",
    );
  });

  it("does not override font-family for the publisher option", () => {
    const css = buildScopedReaderCss({ ...base, font: "publisher" });
    expect(css).not.toContain("var(--font-literata)");
  });

  it("always defines the OpenDyslexic @font-face", () => {
    const css = buildScopedReaderCss({ ...base, font: "opendyslexic" });
    expect(css).toContain("OpenDyslexic");
    expect(css).toContain("/fonts/OpenDyslexic-Regular.woff2");
  });

  it("adds the editorial drop cap + display headings only in editorial mode", () => {
    const std = buildScopedReaderCss({ ...base, font: "garamond" });
    const ed = buildScopedReaderCss({ ...base, font: "garamond", mode: "editorial" });
    expect(std).not.toContain("::first-letter");
    expect(ed).toContain("::first-letter");
    expect(ed).toContain('[data-mode="editorial"]');
  });
});

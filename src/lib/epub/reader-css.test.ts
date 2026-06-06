import { describe, it, expect } from "vitest";
import { buildScopedReaderCss, READER_FONT_STACKS } from "./reader-css";

const theme = { bg: "#fff", fg: "#111", link: "#90f", selection: "#eee" };
const base = { fontSizePct: 100, lineHeight: 1.6, marginPct: 6, mode: "standard" as const };

describe("buildScopedReaderCss", () => {
  it("scopes every rule to .goread-reader and injects theme + typography", () => {
    const css = buildScopedReaderCss(theme, { ...base, font: "literata" });
    expect(css).toContain(".goread-reader{");
    expect(css).toContain("color:#111");
    expect(css).toContain("line-height:1.6");
    expect(css).toContain("padding:28px 6%");
    expect(css).toContain("font-size:20px"); // 20 * 100%
    expect(css).toContain(READER_FONT_STACKS.literata as string);
    // the selection colour is scoped, not global
    expect(css).toContain(".goread-reader ::selection{background:#eee;}");
  });

  it("scales the base font size with the percentage", () => {
    expect(
      buildScopedReaderCss(theme, { ...base, font: "inter", fontSizePct: 150 }),
    ).toContain("font-size:30px");
  });

  it("does not override font-family for the publisher option", () => {
    const css = buildScopedReaderCss(theme, { ...base, font: "publisher" });
    expect(css).not.toContain("var(--font-literata)");
  });

  it("always defines the OpenDyslexic @font-face", () => {
    const css = buildScopedReaderCss(theme, { ...base, font: "opendyslexic" });
    expect(css).toContain("OpenDyslexic");
    expect(css).toContain("/fonts/OpenDyslexic-Regular.woff2");
  });

  it("adds the editorial drop cap + display headings only in editorial mode", () => {
    const std = buildScopedReaderCss(theme, { ...base, font: "garamond" });
    const ed = buildScopedReaderCss(theme, { ...base, font: "garamond", mode: "editorial" });
    expect(std).not.toContain("::first-letter");
    expect(ed).toContain("::first-letter");
    expect(ed).toContain('[data-mode="editorial"]');
  });
});

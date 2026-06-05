import { describe, it, expect } from "vitest";
import { buildReaderCss, buildReaderDocument, READER_FONT_STACKS } from "./reader-css";

const theme = { bg: "#fff", fg: "#111", link: "#90f", selection: "#eee" };

describe("buildReaderCss", () => {
  it("injects theme colours and typography", () => {
    const css = buildReaderCss(theme, { font: "literata", fontSizePct: 100, lineHeight: 1.6, marginPct: 6 });
    expect(css).toContain("background:#fff");
    expect(css).toContain("color:#111");
    expect(css).toContain("line-height:1.6");
    expect(css).toContain("padding:28px 6%");
    expect(css).toContain("font-size:20px"); // 20 * 100%
    expect(css).toContain(READER_FONT_STACKS.literata as string);
  });

  it("scales the base font size with the percentage", () => {
    expect(buildReaderCss(theme, { font: "inter", fontSizePct: 150, lineHeight: 1.5, marginPct: 8 })).toContain(
      "font-size:30px",
    );
  });

  it("does not override font-family for the publisher option", () => {
    const css = buildReaderCss(theme, { font: "publisher", fontSizePct: 100, lineHeight: 1.6, marginPct: 6 });
    // body rule should not start a font-family declaration from our stacks
    expect(css).not.toContain("Georgia, 'Iowan");
  });

  it("always defines the OpenDyslexic @font-face", () => {
    const css = buildReaderCss(theme, { font: "opendyslexic", fontSizePct: 100, lineHeight: 1.6, marginPct: 6 });
    expect(css).toContain("OpenDyslexic");
    expect(css).toContain("/fonts/OpenDyslexic-Regular.woff2");
  });
});

describe("buildReaderDocument", () => {
  it("wraps body html in a full document with the css", () => {
    const doc = buildReaderDocument("body{color:red}", "<p>Hi</p>");
    expect(doc).toContain("<!DOCTYPE html>");
    expect(doc).toContain("body{color:red}");
    expect(doc).toContain("<p>Hi</p>");
  });
});

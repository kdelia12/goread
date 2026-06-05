import { describe, it, expect } from "vitest";
import { dirOf, resolveHref, parseContainerXml, parseOpf } from "./opf";

describe("dirOf", () => {
  it("returns the directory of a zip path", () => {
    expect(dirOf("OEBPS/content.opf")).toBe("OEBPS");
    expect(dirOf("content.opf")).toBe("");
    expect(dirOf("a/b/c.xhtml")).toBe("a/b");
  });
});

describe("resolveHref", () => {
  it("joins relative hrefs against the opf dir", () => {
    expect(resolveHref("OEBPS", "chap1.xhtml")).toBe("OEBPS/chap1.xhtml");
    expect(resolveHref("OEBPS/text", "../images/cover.jpg")).toBe("OEBPS/images/cover.jpg");
    expect(resolveHref("OEBPS", "./chap1.xhtml")).toBe("OEBPS/chap1.xhtml");
  });
  it("strips fragments and query", () => {
    expect(resolveHref("OEBPS", "chap1.xhtml#section2")).toBe("OEBPS/chap1.xhtml");
  });
  it("handles root-absolute hrefs", () => {
    expect(resolveHref("OEBPS", "/styles/main.css")).toBe("styles/main.css");
  });
});

const CONTAINER = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

const OPF = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>Pride and Prejudice</dc:title>
    <dc:creator>Jane Austen</dc:creator>
    <dc:language>en</dc:language>
    <meta name="cover" content="cover-img"/>
  </metadata>
  <manifest>
    <item id="cover-img" href="images/cover.jpg" media-type="image/jpeg"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ch1" href="text/chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch2" href="text/chapter2.xhtml" media-type="application/xhtml+xml"/>
    <item id="css" href="styles/main.css" media-type="text/css"/>
  </manifest>
  <spine>
    <itemref idref="ch1"/>
    <itemref idref="ch2"/>
  </spine>
</package>`;

describe("parseContainerXml", () => {
  it("finds the OPF full-path", () => {
    expect(parseContainerXml(CONTAINER)).toBe("OEBPS/content.opf");
  });
  it("returns null when absent", () => {
    expect(parseContainerXml("<container/>")).toBeNull();
  });
});

describe("parseOpf", () => {
  const struct = parseOpf(OPF, "OEBPS/content.opf");

  it("reads Dublin Core metadata", () => {
    expect(struct.title).toBe("Pride and Prejudice");
    expect(struct.creator).toBe("Jane Austen");
    expect(struct.language).toBe("en");
  });

  it("builds the spine in reading order with resolved hrefs", () => {
    expect(struct.spine.map((s) => s.href)).toEqual([
      "OEBPS/text/chapter1.xhtml",
      "OEBPS/text/chapter2.xhtml",
    ]);
    expect(struct.spine[0].mediaType).toBe("application/xhtml+xml");
  });

  it("resolves the cover from the EPUB2 meta tag", () => {
    expect(struct.coverHref).toBe("OEBPS/images/cover.jpg");
  });

  it("prefers an EPUB3 cover-image property when present", () => {
    const epub3 = OPF.replace(
      '<item id="cover-img" href="images/cover.jpg" media-type="image/jpeg"/>',
      '<item id="cover-img" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>',
    );
    expect(parseOpf(epub3, "OEBPS/content.opf").coverHref).toBe("OEBPS/images/cover.jpg");
  });
});

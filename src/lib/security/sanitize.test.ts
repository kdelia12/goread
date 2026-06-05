import { describe, it, expect } from "vitest";
import { sanitizeEpubHtml, sanitizeInline } from "./sanitize";

describe("sanitizeEpubHtml — strips active content", () => {
  it("removes <script> but keeps surrounding text", () => {
    const out = sanitizeEpubHtml("<p>Hello <script>alert(1)</script>world</p>");
    expect(out).not.toMatch(/script/i);
    expect(out).toContain("Hello");
    expect(out).toContain("world");
  });

  it("removes inline event handlers", () => {
    const out = sanitizeEpubHtml('<img src="x.jpg" onerror="alert(1)">');
    expect(out).not.toMatch(/onerror/i);
  });

  it("neutralizes javascript: links", () => {
    const out = sanitizeEpubHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toMatch(/javascript:/i);
  });

  it("removes iframe/object/embed/form/style", () => {
    expect(sanitizeEpubHtml('<iframe src="evil"></iframe>')).not.toMatch(/iframe/i);
    expect(sanitizeEpubHtml('<object data="evil"></object>')).not.toMatch(/object/i);
    expect(sanitizeEpubHtml("<form><input></form>")).not.toMatch(/<form|<input/i);
    expect(sanitizeEpubHtml("<style>body{x:url(evil)}</style>")).not.toMatch(/<style/i);
  });

  it("strips script smuggled inside svg", () => {
    const out = sanitizeEpubHtml("<svg><script>alert(1)</script></svg>");
    expect(out).not.toMatch(/script/i);
  });

  it("keeps benign formatting and https images", () => {
    const out = sanitizeEpubHtml(
      '<p><em>Chapter I</em> <strong>begins</strong> <img src="https://www.gutenberg.org/x.jpg"></p>',
    );
    expect(out).toContain("<em>");
    expect(out).toContain("<strong>");
    expect(out).toContain("https://www.gutenberg.org/x.jpg");
  });
});

describe("sanitizeInline", () => {
  it("allows a tiny tag whitelist only", () => {
    const out = sanitizeInline('<b>bold</b><script>x</script><div>nope</div>');
    expect(out).toContain("<b>bold</b>");
    expect(out).not.toMatch(/script/i);
    expect(out).not.toMatch(/<div/i);
  });
});

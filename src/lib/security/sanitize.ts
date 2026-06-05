import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize a chapter of EPUB HTML before it is injected into the reader.
 * Project Gutenberg content is generally benign, but EPUBs are arbitrary
 * zip archives — never trust their XHTML. Scripts, event handlers, and
 * `javascript:` URLs are stripped by DOMPurify; we additionally forbid tags
 * that could exfiltrate or reframe (iframe/object/embed/form/link/meta/base)
 * and drop <style> since the reader supplies its own typography.
 *
 * This is layer two: book content is also rendered inside a sandboxed iframe
 * (no allow-scripts), so even a DOMPurify bypass cannot execute code.
 */
export function sanitizeEpubHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    WHOLE_DOCUMENT: false,
    FORBID_TAGS: [
      "script",
      "iframe",
      "object",
      "embed",
      "form",
      "input",
      "button",
      "link",
      "meta",
      "base",
      "style",
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["epub:type"],
  });
}

/** Sanitize a short rich string (e.g. a user note rendered as light markup). */
export function sanitizeInline(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "br", "p", "span"],
    ALLOWED_ATTR: ["href"],
    ALLOW_DATA_ATTR: false,
  });
}

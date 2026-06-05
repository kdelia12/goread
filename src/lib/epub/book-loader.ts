import JSZip from "jszip";
import { parseContainerXml, parseOpf, resolveHref, dirOf, type EpubStructure } from "./opf";
import { sanitizeEpubHtml } from "../security/sanitize";

/** A loaded EPUB: parsed structure plus the open zip for lazy chapter reads. */
export interface LoadedBook {
  structure: EpubStructure;
  zip: JSZip;
  objectUrls: string[];
}

export async function loadEpub(url: string): Promise<LoadedBook> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not download this book (${res.status}).`);
  const buf = await res.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);

  const containerXml = await zip.file("META-INF/container.xml")?.async("string");
  if (!containerXml) throw new Error("This file isn’t a valid EPUB (no container).");
  const opfPath = parseContainerXml(containerXml);
  if (!opfPath) throw new Error("This EPUB has no package document.");
  const opfXml = await zip.file(opfPath)?.async("string");
  if (!opfXml) throw new Error("This EPUB’s package document is missing.");

  const structure = parseOpf(opfXml, opfPath);
  if (structure.spine.length === 0) throw new Error("This EPUB has no readable chapters.");
  return { structure, zip, objectUrls: [] };
}

/**
 * Read one spine chapter, sanitize it, and rewrite in-zip image references to
 * blob URLs so they render. Returns body inner HTML ready to drop into the
 * reading iframe.
 */
export async function renderChapterHtml(book: LoadedBook, index: number): Promise<string> {
  const item = book.structure.spine[index];
  if (!item) return "";
  const raw = (await book.zip.file(item.href)?.async("string")) ?? "";
  const sanitized = sanitizeEpubHtml(raw);

  const doc = new DOMParser().parseFromString(sanitized, "text/html");
  const chapterDir = dirOf(item.href);

  for (const img of Array.from(doc.querySelectorAll("img"))) {
    const src = img.getAttribute("src");
    if (!src || src.startsWith("data:") || /^https?:/i.test(src)) continue;
    const path = resolveHref(chapterDir, src);
    const file = book.zip.file(path);
    if (!file) {
      img.remove();
      continue;
    }
    try {
      const blob = await file.async("blob");
      const objUrl = URL.createObjectURL(blob);
      book.objectUrls.push(objUrl);
      img.setAttribute("src", objUrl);
      img.setAttribute("loading", "lazy");
    } catch {
      img.remove();
    }
  }

  return doc.body?.innerHTML ?? sanitized;
}

export function releaseBook(book: LoadedBook | null): void {
  if (!book) return;
  for (const url of book.objectUrls) URL.revokeObjectURL(url);
  book.objectUrls = [];
}

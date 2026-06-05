/**
 * Minimal, dependency-free EPUB structure parsing: read META-INF/container.xml
 * to locate the OPF, then parse the OPF for its spine (reading order),
 * metadata, and cover. Uses DOMParser, which exists in the browser (the reader
 * runs client-side) and in jsdom (tests). Path math is pure and unit-tested.
 */

const DC_NS = "http://purl.org/dc/elements/1.1/";

export interface SpineItem {
  idref: string;
  href: string;
  mediaType: string;
}

export interface EpubStructure {
  opfPath: string;
  title: string | null;
  creator: string | null;
  language: string | null;
  spine: SpineItem[];
  coverHref: string | null;
}

/** Directory portion of a zip path ("OEBPS/content.opf" -> "OEBPS"). */
export function dirOf(path: string): string {
  const i = path.lastIndexOf("/");
  return i === -1 ? "" : path.slice(0, i);
}

/** Resolve a relative href against a base directory, collapsing ./ and ../. */
export function resolveHref(baseDir: string, href: string): string {
  const clean = href.split("#")[0].split("?")[0];
  if (clean.startsWith("/")) return clean.replace(/^\/+/, "");
  const stack = baseDir ? baseDir.split("/").filter(Boolean) : [];
  for (const part of clean.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return stack.join("/");
}

function parseXml(xml: string): Document {
  return new DOMParser().parseFromString(xml, "application/xml");
}

/** Returns the full-path of the OPF package document, or null. */
export function parseContainerXml(xml: string): string | null {
  const doc = parseXml(xml);
  const rootfiles = doc.getElementsByTagName("rootfile");
  for (const rf of Array.from(rootfiles)) {
    const path = rf.getAttribute("full-path");
    if (path) return path;
  }
  return null;
}

function firstDcText(doc: Document, tag: string): string | null {
  const byNs = doc.getElementsByTagNameNS(DC_NS, tag);
  if (byNs.length > 0) return byNs[0].textContent?.trim() || null;
  const byName = doc.getElementsByTagName(`dc:${tag}`);
  if (byName.length > 0) return byName[0].textContent?.trim() || null;
  return null;
}

export function parseOpf(xml: string, opfPath: string): EpubStructure {
  const doc = parseXml(xml);
  const opfDir = dirOf(opfPath);

  const manifest = new Map<
    string,
    { href: string; mediaType: string; properties: string }
  >();
  for (const item of Array.from(doc.getElementsByTagName("item"))) {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    if (!id || !href) continue;
    manifest.set(id, {
      href: resolveHref(opfDir, href),
      mediaType: item.getAttribute("media-type") ?? "",
      properties: item.getAttribute("properties") ?? "",
    });
  }

  const spine: SpineItem[] = [];
  for (const ref of Array.from(doc.getElementsByTagName("itemref"))) {
    const idref = ref.getAttribute("idref");
    if (!idref) continue;
    const item = manifest.get(idref);
    if (!item) continue;
    spine.push({ idref, href: item.href, mediaType: item.mediaType });
  }

  // cover: EPUB3 properties="cover-image", else EPUB2 <meta name="cover">
  let coverHref: string | null = null;
  for (const item of manifest.values()) {
    if (item.properties.split(/\s+/).includes("cover-image")) {
      coverHref = item.href;
      break;
    }
  }
  if (!coverHref) {
    for (const meta of Array.from(doc.getElementsByTagName("meta"))) {
      if (meta.getAttribute("name") === "cover") {
        const ref = manifest.get(meta.getAttribute("content") ?? "");
        if (ref) coverHref = ref.href;
      }
    }
  }

  return {
    opfPath,
    title: firstDcText(doc, "title"),
    creator: firstDcText(doc, "creator"),
    language: firstDcText(doc, "language"),
    spine,
    coverHref,
  };
}

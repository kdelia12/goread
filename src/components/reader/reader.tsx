"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  List,
  Settings2,
  Bookmark,
  Quote as QuoteIcon,
  X,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";
import {
  loadEpub,
  renderChapterHtml,
  releaseBook,
  type LoadedBook,
} from "@/lib/epub/book-loader";
import { buildReaderCss, buildReaderDocument } from "@/lib/epub/reader-css";
import {
  getPreferences,
  savePreferences,
  getProgress,
  saveProgress,
  markReadToday,
  addBookmark,
  addQuote,
} from "@/lib/local-store";
import { formatPercent } from "@/lib/reading-position";
import { cleanQuoteText, makeQuoteId, quoteCaption, quoteAttribution } from "@/lib/share/quotes";
import { coverPaletteFor } from "@/lib/cover";
import { ShareDialog } from "@/components/share/share-dialog";
import type { Preferences, ReaderFont } from "@/lib/types";

interface ReaderProps {
  id: number;
  title: string;
  author: string;
}

const FONT_OPTIONS: { value: ReaderFont; label: string }[] = [
  { value: "literata", label: "Serif" },
  { value: "libre-baskerville", label: "Baskerville" },
  { value: "inter", label: "Sans" },
  { value: "opendyslexic", label: "OpenDyslexic" },
  { value: "publisher", label: "Publisher" },
];

function tocLabel(href: string, i: number): string {
  const base = href.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
  const pretty = base.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return /^\d/.test(pretty) || pretty.length < 3 ? `Section ${i + 1}` : pretty;
}

export function Reader({ id, title, author }: ReaderProps) {
  const { resolvedTheme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const bookRef = useRef<LoadedBook | null>(null);
  const restoreFracRef = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detachScrollRef = useRef<(() => void) | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [chapter, setChapter] = useState(0);
  const [spineLen, setSpineLen] = useState(0);
  const [html, setHtml] = useState("");
  const [pct, setPct] = useState(0);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [panel, setPanel] = useState<"none" | "settings" | "toc">("none");
  const [toc, setToc] = useState<{ label: string; index: number }[]>([]);
  const [colors, setColors] = useState({ bg: "#fff", fg: "#111", link: "#915", selection: "#eee" });
  const [hint, setHint] = useState<string | null>(null);
  const [share, setShare] = useState<
    null | { spec: Parameters<typeof ShareDialog>[0]["spec"]; caption: string }
  >(null);

  useEffect(() => setPrefs(getPreferences()), []);

  // Pull the reading-theme colours out of the active data-theme.
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
    setColors({
      bg: v("--reader-bg", "#fff"),
      fg: v("--reader-fg", "#111"),
      link: v("--reader-link", "#915"),
      selection: v("--reader-selection", "#eee"),
    });
  }, [resolvedTheme]);

  // Download + parse the EPUB.
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    loadEpub(`/api/books/${id}/content`)
      .then((book) => {
        if (cancelled) return releaseBook(book);
        bookRef.current = book;
        setSpineLen(book.structure.spine.length);
        setToc(book.structure.spine.map((s, i) => ({ label: tocLabel(s.href, i), index: i })));
        const saved = getProgress(id);
        let startCh = 0;
        if (saved?.cfi?.startsWith("chapter:")) {
          const [, chStr, fracStr] = saved.cfi.split(":");
          startCh = Math.min(book.structure.spine.length - 1, Math.max(0, parseInt(chStr, 10) || 0));
          restoreFracRef.current = Number(fracStr) || 0;
        }
        setChapter(startCh);
        setPct(saved?.percentage ?? 0);
        setStatus("ready");
        markReadToday();
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load this book.");
        setStatus("error");
      });
    return () => {
      cancelled = true;
      releaseBook(bookRef.current);
      bookRef.current = null;
    };
  }, [id]);

  // Render the current chapter's HTML.
  useEffect(() => {
    if (status !== "ready" || !bookRef.current) return;
    let cancelled = false;
    renderChapterHtml(bookRef.current, chapter)
      .then((h) => {
        if (!cancelled) setHtml(h);
      })
      .catch(() => {
        if (!cancelled) setHtml("<p>Sorry — this chapter couldn’t be displayed.</p>");
      });
    return () => {
      cancelled = true;
    };
  }, [chapter, status]);

  // Tear down scroll listeners + timers on unmount.
  useEffect(
    () => () => {
      detachScrollRef.current?.();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    [],
  );

  // Close the side panel on Escape.
  useEffect(() => {
    if (panel === "none") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel("none");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel]);

  // Re-inject the document whenever content, theme, or typography changes.
  useEffect(() => {
    if (!prefs || !iframeRef.current || !html) return;
    const css = buildReaderCss(colors, {
      font: prefs.readerFont,
      fontSizePct: prefs.fontSizePct,
      lineHeight: prefs.lineHeight,
      marginPct: prefs.marginPct,
    });
    iframeRef.current.srcdoc = buildReaderDocument(css, html);
  }, [html, colors, prefs]);

  const onIframeLoad = useCallback(() => {
    detachScrollRef.current?.(); // drop any listener from a previous document
    const iframe = iframeRef.current;
    const win = iframe?.contentWindow;
    const docEl = iframe?.contentDocument?.documentElement;
    if (!win || !docEl) return;

    const frac = restoreFracRef.current;
    restoreFracRef.current = 0;
    const max = docEl.scrollHeight - win.innerHeight;
    if (frac > 0 && max > 0) win.scrollTo(0, frac * max);

    const onScroll = () => {
      const sh = docEl.scrollHeight - win.innerHeight;
      const f = sh > 0 ? Math.min(1, Math.max(0, win.scrollY / sh)) : 0;
      const overall = spineLen > 0 ? (chapter + f) / spineLen : 0;
      setPct(overall);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveProgress({
          bookId: id,
          cfi: `chapter:${chapter}:${f.toFixed(4)}`,
          percentage: overall,
          locationLabel: null,
          deviceId: null,
          updatedAt: Date.now(),
        });
      }, 600);
    };
    win.addEventListener("scroll", onScroll, { passive: true });
    detachScrollRef.current = () => win.removeEventListener("scroll", onScroll);
    onScroll();
  }, [chapter, spineLen, id]);

  function go(delta: number) {
    if (spineLen === 0) return;
    setChapter((c) => Math.max(0, Math.min(spineLen - 1, c + delta)));
    setPanel("none");
  }

  function updatePrefs(patch: Partial<Preferences>) {
    setPrefs(savePreferences(patch));
  }

  function flashHint(msg: string) {
    setHint(msg);
    setTimeout(() => setHint(null), 2600);
  }

  function bookmarkHere() {
    const now = Date.now();
    addBookmark({
      id: `bm_${id}_${now}`,
      bookId: id,
      cfi: `chapter:${chapter}`,
      percentage: pct,
      label: `${formatPercent(pct)} · ${toc[chapter]?.label ?? `Section ${chapter + 1}`}`,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
    flashHint("Bookmark saved.");
  }

  function captureQuote() {
    const selection = iframeRef.current?.contentDocument?.getSelection?.()?.toString() ?? "";
    const text = cleanQuoteText(selection);
    if (!text) {
      flashHint("Select some text in the page, then tap Quote.");
      return;
    }
    const now = Date.now();
    addQuote({
      id: makeQuoteId(id, text, now),
      bookId: id,
      bookTitle: title,
      author,
      text,
      note: null,
      createdAt: now,
    });
    setShare({
      spec: {
        kind: "quote",
        text,
        attribution: quoteAttribution({ author, bookTitle: title }),
        palette: coverPaletteFor(title),
      },
      caption: quoteCaption({ text, author, bookTitle: title }),
    });
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col bg-reader-bg text-reader-fg">
      {/* progress line */}
      <div className="h-1 w-full bg-surface-2">
        <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${Math.round(pct * 100)}%` }} />
      </div>

      {/* top bar */}
      <div className="flex h-12 shrink-0 items-center gap-1 border-b border-border px-2 sm:px-4">
        <Link
          href={`/book/${id}`}
          aria-label="Back to book"
          className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius)] text-muted-fg hover:bg-surface-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold text-fg">{title}</p>
        </div>
        <span className="mr-1 hidden text-xs tabular-nums text-muted-fg sm:inline">
          {formatPercent(pct)}
        </span>
        <IconBtn label="Save quote" onClick={captureQuote}>
          <QuoteIcon className="h-5 w-5" />
        </IconBtn>
        <IconBtn label="Bookmark" onClick={bookmarkHere}>
          <Bookmark className="h-5 w-5" />
        </IconBtn>
        <IconBtn label="Contents" onClick={() => setPanel((p) => (p === "toc" ? "none" : "toc"))}>
          <List className="h-5 w-5" />
        </IconBtn>
        <IconBtn label="Settings" onClick={() => setPanel((p) => (p === "settings" ? "none" : "settings"))}>
          <Settings2 className="h-5 w-5" />
        </IconBtn>
      </div>

      {/* reading surface */}
      <div className="relative flex-1 overflow-hidden">
        {status === "loading" ? (
          <div className="flex h-full items-center justify-center gap-2 text-muted-fg">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading book…
          </div>
        ) : null}
        {status === "error" ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-display text-xl font-semibold text-fg">Couldn’t open this book</p>
            <p className="max-w-md text-sm text-muted-fg">{error}</p>
            <Link href={`/book/${id}`} className="text-sm text-accent underline">
              Back to book details
            </Link>
          </div>
        ) : null}
        <iframe
          ref={iframeRef}
          onLoad={onIframeLoad}
          title={`${title} — reading surface`}
          sandbox="allow-same-origin"
          className="h-full w-full border-0"
          style={{ display: status === "ready" ? "block" : "none" }}
        />

        {/* side panels */}
        {panel !== "none" ? (
          <>
            <div className="absolute inset-0 z-10 bg-black/20" onClick={() => setPanel("none")} />
            <aside
              role="dialog"
              aria-modal="true"
              aria-label={panel === "settings" ? "Reading settings" : "Contents"}
              className="absolute right-0 top-0 z-20 flex h-full w-80 max-w-[85%] flex-col border-l border-border bg-surface shadow-2xl"
            >
              <div className="flex h-12 items-center justify-between border-b border-border px-2 pl-4">
                <h2 className="font-display text-base font-semibold text-fg">
                  {panel === "settings" ? "Reading settings" : "Contents"}
                </h2>
                <button
                  aria-label="Close"
                  onClick={() => setPanel("none")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius)] text-muted-fg hover:bg-surface-2 hover:text-fg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {panel === "settings" && prefs ? (
                  <SettingsPanel prefs={prefs} onChange={updatePrefs} />
                ) : null}
                {panel === "toc" ? (
                  <ul className="space-y-0.5">
                    {toc.map((t) => (
                      <li key={t.index}>
                        <button
                          onClick={() => go(t.index - chapter)}
                          className={`w-full truncate rounded px-2 py-2 text-left text-sm hover:bg-surface-2 ${
                            t.index === chapter ? "font-semibold text-accent" : "text-fg"
                          }`}
                        >
                          {t.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </aside>
          </>
        ) : null}
      </div>

      {/* bottom nav */}
      <div className="flex h-14 shrink-0 items-center justify-between border-t border-border px-4">
        <button
          onClick={() => go(-1)}
          disabled={chapter <= 0}
          className="inline-flex h-9 items-center gap-1 rounded-[var(--radius)] px-3 text-sm text-fg hover:bg-surface-2 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <span className="text-xs tabular-nums text-muted-fg">
          {spineLen > 0 ? `${chapter + 1} / ${spineLen}` : ""}
        </span>
        <button
          onClick={() => go(1)}
          disabled={chapter >= spineLen - 1}
          className="inline-flex h-9 items-center gap-1 rounded-[var(--radius)] px-3 text-sm text-fg hover:bg-surface-2 disabled:opacity-40"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {hint ? (
        <div className="pointer-events-none fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-fg px-4 py-2 text-sm text-bg shadow-lg">
          {hint}
        </div>
      ) : null}

      {share ? (
        <ShareDialog
          spec={share.spec}
          caption={share.caption}
          filename={`goread-quote-${id}.png`}
          onClose={() => setShare(null)}
        />
      ) : null}
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius)] text-muted-fg transition-colors hover:bg-surface-2 hover:text-fg"
    >
      {children}
    </button>
  );
}

function SettingsPanel({
  prefs,
  onChange,
}: {
  prefs: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
}) {
  return (
    <div className="space-y-6">
      <Stepper
        label="Font size"
        value={`${prefs.fontSizePct}%`}
        onDec={() => onChange({ fontSizePct: Math.max(70, prefs.fontSizePct - 10) })}
        onInc={() => onChange({ fontSizePct: Math.min(220, prefs.fontSizePct + 10) })}
      />
      <Stepper
        label="Line spacing"
        value={prefs.lineHeight.toFixed(1)}
        onDec={() => onChange({ lineHeight: Math.max(1.2, +(prefs.lineHeight - 0.1).toFixed(1)) })}
        onInc={() => onChange({ lineHeight: Math.min(2.4, +(prefs.lineHeight + 0.1).toFixed(1)) })}
      />
      <Stepper
        label="Margins"
        value={`${prefs.marginPct}%`}
        onDec={() => onChange({ marginPct: Math.max(0, prefs.marginPct - 2) })}
        onInc={() => onChange({ marginPct: Math.min(24, prefs.marginPct + 2) })}
      />
      <div>
        <p className="mb-2 text-sm font-medium text-fg">Typeface</p>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => onChange({ readerFont: f.value })}
              className={`rounded-[var(--radius)] border px-3 py-2 text-sm transition-colors ${
                prefs.readerFont === f.value
                  ? "border-accent bg-accent-soft text-fg"
                  : "border-border text-fg hover:bg-surface-2"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-fg">
          Tip: switch the colour theme any time from the palette icon in the top bar.
        </p>
      </div>
    </div>
  );
}

function Stepper({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string;
  value: string;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-fg">{label}</span>
      <div className="flex items-center gap-2">
        <button
          aria-label={`Decrease ${label}`}
          onClick={onDec}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border border-border text-fg hover:bg-surface-2"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-sm tabular-nums text-fg">{value}</span>
        <button
          aria-label={`Increase ${label}`}
          onClick={onInc}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border border-border text-fg hover:bg-surface-2"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

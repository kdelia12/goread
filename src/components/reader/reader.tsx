"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  HelpCircle,
} from "lucide-react";
import {
  loadEpub,
  renderChapterHtml,
  renderAllHtml,
  releaseBook,
  type LoadedBook,
} from "@/lib/epub/book-loader";
import { buildScopedReaderCss } from "@/lib/epub/reader-css";
import {
  getPreferences,
  savePreferences,
  getProgress,
  saveProgress,
  markReadToday,
  addBookmark,
  removeBookmark,
  getBookmarks,
  addQuote,
  getSkipReaderTutorial,
  setSkipReaderTutorial,
} from "@/lib/local-store";
import { formatPercent } from "@/lib/reading-position";
import { cn } from "@/lib/utils";
import { cleanQuoteText, makeQuoteId, quoteCaption, quoteAttribution } from "@/lib/share/quotes";
import { coverPaletteFor } from "@/lib/cover";
import { ShareDialog } from "@/components/share/share-dialog";
import { ReaderTutorial } from "@/components/reader/reader-tutorial";
import type { Preferences, ReaderFont } from "@/lib/types";

interface ReaderProps {
  id: number;
  title: string;
  author: string;
}

const FONT_OPTIONS: { value: ReaderFont; label: string }[] = [
  { value: "literata", label: "Serif" },
  { value: "garamond", label: "Garamond" },
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

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

export function Reader({ id, title, author }: ReaderProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<LoadedBook | null>(null);
  const restoreFracRef = useRef(0);
  const restorePctRef = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advancedRef = useRef(false);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [chapter, setChapter] = useState(0);
  const [spineLen, setSpineLen] = useState(0);
  const [html, setHtml] = useState("");
  const [pct, setPct] = useState(0);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [panel, setPanel] = useState<"none" | "settings" | "toc">("none");
  const [toc, setToc] = useState<{ label: string; index: number }[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [tutorial, setTutorial] = useState(false);
  const [share, setShare] = useState<
    null | { spec: Parameters<typeof ShareDialog>[0]["spec"]; caption: string }
  >(null);

  const continuous = prefs?.continuousScroll ?? false;
  const autoAdvance = prefs?.autoAdvance ?? false;
  const readingMode = prefs?.readingMode ?? "standard";

  useEffect(() => {
    setPrefs(getPreferences());
    if (!getSkipReaderTutorial()) setTutorial(true);
  }, []);

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
        const n = book.structure.spine.length;
        restorePctRef.current = saved?.percentage ?? 0;
        let startCh = 0;
        if (saved?.cfi?.startsWith("chapter:")) {
          const [, chStr, fracStr] = saved.cfi.split(":");
          startCh = Math.min(n - 1, Math.max(0, parseInt(chStr, 10) || 0));
          restoreFracRef.current = Number(fracStr) || 0;
        } else if (saved?.percentage && n > 0) {
          startCh = Math.min(n - 1, Math.floor(saved.percentage * n));
          restoreFracRef.current = (saved.percentage * n) % 1;
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

  // Render the current chapter (or the whole book, in continuous mode).
  useEffect(() => {
    if (status !== "ready" || !bookRef.current) return;
    let cancelled = false;
    const job = continuous
      ? renderAllHtml(bookRef.current)
      : renderChapterHtml(bookRef.current, chapter);
    job
      .then((h) => {
        if (!cancelled) setHtml(h);
      })
      .catch(() => {
        if (!cancelled) setHtml("<p>Sorry — this couldn’t be displayed.</p>");
      });
    return () => {
      cancelled = true;
    };
  }, [chapter, status, continuous]);

  // Reset the auto-advance latch whenever the chapter changes.
  useEffect(() => {
    advancedRef.current = false;
  }, [chapter, continuous]);

  // Tear down timers on unmount.
  useEffect(
    () => () => {
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

  // Reflect whether the current chapter is already bookmarked.
  useEffect(() => {
    const existing = getBookmarks(id).find((b) => b.cfi?.startsWith(`chapter:${chapter}`));
    setBookmarkId(existing?.id ?? null);
  }, [id, chapter]);

  const scopedCss = useMemo(
    () =>
      prefs
        ? buildScopedReaderCss({
            font: prefs.readerFont,
            fontSizePct: prefs.fontSizePct,
            lineHeight: prefs.lineHeight,
            marginPct: prefs.marginPct,
            mode: prefs.readingMode,
          })
        : "",
    [prefs],
  );

  const go = useCallback(
    (delta: number) => {
      setChapter((c) => Math.max(0, Math.min(spineLen - 1, c + delta)));
      setPanel("none");
    },
    [spineLen],
  );

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const sh = el.scrollHeight - el.clientHeight;
    const f = sh > 0 ? clamp01(el.scrollTop / sh) : 0;
    const overall = continuous ? f : spineLen > 0 ? (chapter + f) / spineLen : 0;
    setPct(overall);

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveProgress({
        bookId: id,
        cfi: continuous ? `scroll:${f.toFixed(4)}` : `chapter:${chapter}:${f.toFixed(4)}`,
        percentage: overall,
        locationLabel: null,
        deviceId: null,
        updatedAt: Date.now(),
      });
    }, 600);

    // Auto-advance to the next chapter once the reader reaches the end.
    if (!continuous && autoAdvance && f >= 0.985 && chapter < spineLen - 1 && !advancedRef.current) {
      advancedRef.current = true;
      flashHint("Next chapter →");
      go(1);
    }
  }, [continuous, spineLen, chapter, autoAdvance, id, go]);

  // Restore the reading position after content (re)renders.
  useLayoutEffect(() => {
    if (status !== "ready" || !html || !scrollRef.current) return;
    const el = scrollRef.current;
    const restore = continuous ? restorePctRef.current : restoreFracRef.current;
    restoreFracRef.current = 0;
    restorePctRef.current = 0;
    const r = requestAnimationFrame(() => {
      const sh = el.scrollHeight - el.clientHeight;
      el.scrollTop = restore > 0 && sh > 0 ? restore * sh : 0;
      onScroll();
    });
    return () => cancelAnimationFrame(r);
    // onScroll intentionally omitted — we only want this on content/mode change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, status, continuous]);

  function gotoChapter(index: number) {
    setPanel("none");
    if (continuous) {
      contentRef.current?.querySelector(`#goread-ch-${index}`)?.scrollIntoView();
    } else {
      setChapter(Math.max(0, Math.min(spineLen - 1, index)));
    }
  }

  function setContinuous(on: boolean) {
    restorePctRef.current = pct;
    if (!on && spineLen > 0) {
      setChapter(Math.min(spineLen - 1, Math.floor(pct * spineLen)));
      restoreFracRef.current = (pct * spineLen) % 1;
    }
    setPrefs(savePreferences({ continuousScroll: on }));
  }

  function updatePrefs(patch: Partial<Preferences>) {
    setPrefs(savePreferences(patch));
  }

  function flashHint(msg: string) {
    setHint(msg);
    setTimeout(() => setHint(null), 2400);
  }

  function toggleBookmark() {
    if (bookmarkId) {
      removeBookmark(bookmarkId);
      setBookmarkId(null);
      flashHint("Bookmark removed.");
      return;
    }
    const now = Date.now();
    const newId = `bm_${id}_${now}`;
    addBookmark({
      id: newId,
      bookId: id,
      cfi: `chapter:${chapter}`,
      percentage: pct,
      label: `${formatPercent(pct)} · ${toc[chapter]?.label ?? `Section ${chapter + 1}`}`,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
    setBookmarkId(newId);
    flashHint("Bookmarked.");
  }

  function captureQuote() {
    const selection = document.getSelection?.()?.toString() ?? "";
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
        <div
          className="h-full bg-accent transition-[width] duration-200"
          style={{ width: `${Math.round(pct * 100)}%` }}
        />
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
        <IconBtn label="How the reader works" onClick={() => setTutorial(true)}>
          <HelpCircle className="h-5 w-5" />
        </IconBtn>
        <IconBtn label="Save quote" onClick={captureQuote}>
          <QuoteIcon className="h-5 w-5" />
        </IconBtn>
        <IconBtn
          label={bookmarkId ? "Remove bookmark" : "Bookmark this spot"}
          onClick={toggleBookmark}
        >
          <Bookmark
            className={cn("h-5 w-5", bookmarkId && "text-accent")}
            fill={bookmarkId ? "currentColor" : "none"}
          />
        </IconBtn>
        <IconBtn label="Contents" onClick={() => setPanel((p) => (p === "toc" ? "none" : "toc"))}>
          <List className="h-5 w-5" />
        </IconBtn>
        <IconBtn
          label="Settings"
          onClick={() => setPanel((p) => (p === "settings" ? "none" : "settings"))}
        >
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

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className={cn(
            "h-full overflow-y-auto bg-reader-bg text-reader-fg",
            status !== "ready" && "invisible",
          )}
        >
          <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
          <div
            ref={contentRef}
            className="goread-reader"
            data-mode={readingMode}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

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
                  <SettingsPanel prefs={prefs} onChange={updatePrefs} onContinuous={setContinuous} />
                ) : null}
                {panel === "toc" ? (
                  <ul className="space-y-0.5">
                    {toc.map((t) => (
                      <li key={t.index}>
                        <button
                          onClick={() => gotoChapter(t.index)}
                          className={`w-full truncate rounded px-2 py-2 text-left text-sm hover:bg-surface-2 ${
                            !continuous && t.index === chapter
                              ? "font-semibold text-accent"
                              : "text-fg"
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
        {continuous ? (
          <div className="flex w-full items-center justify-center text-xs tabular-nums text-muted-fg">
            {formatPercent(pct)} · continuous scroll
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      {hint ? (
        <div className="pointer-events-none fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-fg px-4 py-2 text-sm text-bg shadow-lg">
          {hint}
        </div>
      ) : null}

      {tutorial ? (
        <ReaderTutorial
          onClose={(skip) => {
            if (skip) setSkipReaderTutorial(true);
            setTutorial(false);
          }}
        />
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

function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between", disabled && "opacity-40")}>
      <span className="text-sm font-medium text-fg">
        {label}
        <span className="block text-xs font-normal text-muted-fg">{hint}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors ${
          checked ? "border-accent bg-accent" : "border-border-strong bg-surface-2"
        } ${disabled ? "cursor-not-allowed" : ""}`}
      >
        <span
          className={`absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full bg-white shadow-md ring-1 ring-black/10 transition-[left] ${
            checked ? "left-[24px]" : "left-[2px]"
          }`}
        />
      </button>
    </div>
  );
}

function SettingsPanel({
  prefs,
  onChange,
  onContinuous,
}: {
  prefs: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
  onContinuous: (on: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <Toggle
        label="Editorial mode"
        hint="Magazine-style: drop caps & display headings"
        checked={prefs.readingMode === "editorial"}
        onChange={(v) => onChange({ readingMode: v ? "editorial" : "standard" })}
      />
      <Toggle
        label="Infinite scroll"
        hint="Scroll the whole book continuously"
        checked={prefs.continuousScroll}
        onChange={onContinuous}
      />
      <Toggle
        label="Auto-advance"
        hint={prefs.continuousScroll ? "Off while infinite scroll is on" : "Jump to the next chapter at the end"}
        checked={prefs.autoAdvance}
        disabled={prefs.continuousScroll}
        onChange={(v) => onChange({ autoAdvance: v })}
      />

      <div className="h-px bg-border" />

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

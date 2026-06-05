"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Share2, Copy, Check, X } from "lucide-react";
import {
  renderStory,
  canvasToBlob,
  SHARE_FONTS,
  SHARE_PALETTES,
  shareFontFamily,
  type StorySpec,
  type ShareFontId,
} from "@/lib/share/story-canvas";
import type { CoverPalette } from "@/lib/cover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareDialogProps {
  spec: StorySpec;
  caption: string;
  filename?: string;
  onClose: () => void;
}

type ShareCapableNavigator = Navigator & {
  canShare?: (data?: ShareData) => boolean;
  share?: (data?: ShareData) => Promise<void>;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

export function ShareDialog({
  spec,
  caption,
  filename = "goread-story.png",
  onClose,
}: ShareDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const coverImgRef = useRef<HTMLImageElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [busy, setBusy] = useState(false);

  const [fontId, setFontId] = useState<ShareFontId>("serif");
  const [palette, setPalette] = useState<CoverPalette>(spec.palette);
  const [coverReady, setCoverReady] = useState(false);

  // Load the cover image once per spec.
  useEffect(() => {
    let cancelled = false;
    setCoverReady(false);
    coverImgRef.current = null;
    setPalette(spec.palette);
    const coverUrl = spec.kind === "book" ? spec.coverUrl : undefined;
    if (!coverUrl) {
      setCoverReady(true);
      return;
    }
    loadImage(coverUrl)
      .then((img) => {
        if (cancelled) return;
        coverImgRef.current = img;
        setCoverReady(true);
      })
      .catch(() => {
        if (!cancelled) setCoverReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [spec]);

  // Re-render whenever the cover, font, or colour changes.
  useEffect(() => {
    if (!coverReady) return;
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvasRef.current = canvas;
    renderStory(canvas, spec, {
      coverImg: coverImgRef.current,
      fontFamily: shareFontFamily(fontId),
      palette,
    });
    setPreview(canvas.toDataURL("image/png"));
  }, [coverReady, fontId, palette, spec]);

  // Feature-detect file sharing + escape/focus handling.
  useEffect(() => {
    try {
      const probe = new File([new Blob()], filename, { type: "image/png" });
      const nav = navigator as ShareCapableNavigator;
      setCanShareFiles(Boolean(nav.canShare?.({ files: [probe] })));
    } catch {
      setCanShareFiles(false);
    }
  }, [filename]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  async function handleShare() {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const blob = await canvasToBlob(canvasRef.current);
      const file = new File([blob], filename, { type: "image/png" });
      const nav = navigator as ShareCapableNavigator;
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], text: caption });
      } else {
        handleDownload();
      }
    } catch {
      /* user cancelled the share sheet */
    } finally {
      setBusy(false);
    }
  }

  function handleDownload() {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview;
    a.download = filename;
    a.click();
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share to your story"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="max-h-[92dvh] w-full max-w-sm overflow-y-auto rounded-[var(--radius)] border border-border bg-surface p-5 shadow-2xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-fg">Share to your story</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius)] text-muted-fg transition-colors hover:bg-surface-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-[var(--radius)] border border-border bg-black">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Story preview"
              className="mx-auto max-h-[44vh] w-full object-contain"
              style={{ aspectRatio: "9 / 16" }}
            />
          ) : (
            <div className="w-full animate-pulse bg-surface-2" style={{ aspectRatio: "9 / 16" }} />
          )}
        </div>

        {/* font picker */}
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-muted-fg">Font</p>
          <div className="flex gap-1.5">
            {SHARE_FONTS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFontId(f.id)}
                style={{ fontFamily: f.family }}
                className={cn(
                  "flex-1 cursor-pointer rounded-[var(--radius)] border px-2 py-1.5 text-xs transition-colors",
                  fontId === f.id
                    ? "border-accent bg-accent-soft text-fg"
                    : "border-border text-fg hover:bg-surface-2",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* colour picker */}
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-muted-fg">Colour</p>
          <div className="flex flex-wrap gap-2">
            {SHARE_PALETTES.map((p, i) => {
              const active = palette.from === p.from && palette.to === p.to;
              return (
                <button
                  key={i}
                  aria-label={`Colour ${i + 1}`}
                  aria-pressed={active}
                  onClick={() => setPalette(p)}
                  className={cn(
                    "h-7 w-7 cursor-pointer rounded-full border-2 transition-transform hover:scale-110",
                    active ? "border-accent" : "border-border",
                  )}
                  style={{ backgroundImage: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
                />
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-fg">
          1080×1920 — sized for Instagram Stories.{" "}
          {canShareFiles ? "Tap Share, then choose Instagram." : "Save the image, then add it to your story."}
        </p>

        <div className="mt-3 space-y-2">
          {canShareFiles ? (
            <Button onClick={handleShare} disabled={busy} className="w-full">
              <Share2 className="h-4 w-4" /> {busy ? "Preparing…" : "Share…"}
            </Button>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleDownload} className="w-full">
              <Download className="h-4 w-4" /> Save image
            </Button>
            <Button variant="outline" onClick={copyCaption} className="w-full">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Caption
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

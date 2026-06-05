import { STORY_WIDTH, STORY_HEIGHT } from "./dimensions";
import { wrapText, clampLines } from "./text";
import { PALETTES, type CoverPalette } from "../cover";

/** Beautiful self-hosted display faces for the share card (see globals.css). */
export const SHARE_FONTS = [
  { id: "playfair", label: "Playfair", name: "Playfair Display", family: "'Playfair Display', Georgia, serif" },
  { id: "cormorant", label: "Cormorant", name: "Cormorant", family: "'Cormorant', Georgia, serif" },
  { id: "fraunces", label: "Fraunces", name: "Fraunces", family: "'Fraunces', Georgia, serif" },
  { id: "garamond", label: "Garamond", name: "EB Garamond", family: "'EB Garamond', Georgia, serif" },
  { id: "inter", label: "Inter", name: "Inter Share", family: "'Inter Share', system-ui, sans-serif" },
] as const;

export type ShareFontId = (typeof SHARE_FONTS)[number]["id"];

export function shareFontFamily(id: ShareFontId): string {
  return SHARE_FONTS.find((f) => f.id === id)?.family ?? SHARE_FONTS[0].family;
}

export function shareFontName(id: ShareFontId): string {
  return SHARE_FONTS.find((f) => f.id === id)?.name ?? SHARE_FONTS[0].name;
}

/** Background colour presets for the share card. */
export const SHARE_PALETTES = PALETTES;

/**
 * Client-only renderer that paints a share card onto a 1080×1920 canvas. Uses
 * Georgia (a universally available serif) so the image renders identically
 * everywhere with no web-font loading race — the size and look never "miss".
 */
export type StorySpec =
  | { kind: "quote"; text: string; attribution: string; palette: CoverPalette }
  | { kind: "streak"; current: number; longest: number; palette: CoverPalette }
  | {
      kind: "book";
      title: string;
      author: string;
      initials: string;
      palette: CoverPalette;
      coverUrl?: string;
    };

const SERIF = "Georgia, 'Times New Roman', serif";
const PAD = 96;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function paintBackground(ctx: CanvasRenderingContext2D, palette: CoverPalette) {
  const g = ctx.createLinearGradient(0, 0, STORY_WIDTH, STORY_HEIGHT);
  g.addColorStop(0, palette.from);
  g.addColorStop(1, palette.to);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);
  // subtle vignette frame
  ctx.strokeStyle = palette.fg;
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 3;
  roundRect(ctx, 48, 48, STORY_WIDTH - 96, STORY_HEIGHT - 96, 28);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function paintWordmark(ctx: CanvasRenderingContext2D, palette: CoverPalette, serif: string) {
  ctx.fillStyle = palette.fg;
  ctx.globalAlpha = 0.92;
  ctx.font = `italic 600 56px ${serif}`;
  ctx.textAlign = "center";
  ctx.fillText("goread", STORY_WIDTH / 2, 150);
  ctx.globalAlpha = 0.7;
  ctx.font = `400 26px ${serif}`;
  ctx.fillText("the classics, free", STORY_WIDTH / 2, 196);
  ctx.globalAlpha = 1;
}

function paintLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  startY: number,
  lineHeight: number,
  x = STORY_WIDTH / 2,
): number {
  let y = startY;
  for (const line of lines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

/** Draw an image to cover a rounded rect (object-fit: cover). */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  w0: number,
  h0: number,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
  const imgRatio = w0 / h0;
  const boxRatio = w / h;
  let dw: number;
  let dh: number;
  if (imgRatio > boxRatio) {
    dh = h;
    dw = h * imgRatio;
  } else {
    dw = w;
    dh = w / imgRatio;
  }
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

export interface RenderOptions {
  coverImg?: HTMLImageElement | null;
  /** override the card font (see SHARE_FONTS); defaults to serif */
  fontFamily?: string;
  /** override the background palette; defaults to spec.palette */
  palette?: CoverPalette;
}

export function renderStory(
  canvas: HTMLCanvasElement,
  spec: StorySpec,
  opts: RenderOptions = {},
): void {
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const palette = opts.palette ?? spec.palette;
  const serif = opts.fontFamily ?? SERIF;
  const coverImg = opts.coverImg;

  paintBackground(ctx, palette);
  paintWordmark(ctx, palette, serif);
  ctx.fillStyle = palette.fg;
  ctx.textAlign = "center";

  if (spec.kind === "quote") {
    const maxW = STORY_WIDTH - PAD * 2;
    const fontSize = spec.text.length > 240 ? 60 : spec.text.length > 120 ? 72 : 88;
    ctx.font = `500 ${fontSize}px ${serif}`;
    const measure = (t: string) => ctx.measureText(t).width;
    const lines = clampLines(wrapText(`“${spec.text}”`, maxW, measure), 12);
    const lineHeight = fontSize * 1.32;
    const blockHeight = lines.length * lineHeight;
    const startY = STORY_HEIGHT / 2 - blockHeight / 2;
    const endY = paintLines(ctx, lines, startY, lineHeight);
    ctx.globalAlpha = 0.85;
    ctx.font = `italic 400 38px ${serif}`;
    ctx.fillText(spec.attribution, STORY_WIDTH / 2, endY + 70);
    ctx.globalAlpha = 1;
  } else if (spec.kind === "streak") {
    ctx.font = `600 360px ${serif}`;
    ctx.fillText(String(spec.current), STORY_WIDTH / 2, STORY_HEIGHT / 2 + 60);
    ctx.font = `500 64px ${serif}`;
    ctx.fillText(
      spec.current === 1 ? "day reading streak" : "days reading streak",
      STORY_WIDTH / 2,
      STORY_HEIGHT / 2 + 200,
    );
    ctx.globalAlpha = 0.8;
    ctx.font = `400 40px ${serif}`;
    ctx.fillText(`Longest: ${spec.longest} days`, STORY_WIDTH / 2, STORY_HEIGHT / 2 + 280);
    ctx.globalAlpha = 1;
  } else {
    // book
    const cw = 460;
    const ch = 690;
    const cx = STORY_WIDTH / 2 - cw / 2;
    const cy = STORY_HEIGHT / 2 - ch / 2 - 60;
    if (coverImg && coverImg.width > 0 && coverImg.height > 0) {
      drawImageCover(ctx, coverImg, coverImg.width, coverImg.height, cx, cy, cw, ch, 18);
    } else {
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = palette.fg;
      roundRect(ctx, cx, cy, cw, ch, 18);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = palette.fg;
      ctx.font = `600 200px ${serif}`;
      ctx.fillText(spec.initials, STORY_WIDTH / 2, cy + ch / 2 + 70);
    }
    ctx.fillStyle = palette.fg;

    const maxW = STORY_WIDTH - PAD * 2;
    ctx.font = `600 64px ${serif}`;
    const measure = (t: string) => ctx.measureText(t).width;
    const titleLines = clampLines(wrapText(spec.title, maxW, measure), 3);
    const titleY = cy + ch + 90;
    const endY = paintLines(ctx, titleLines, titleY, 76);
    ctx.globalAlpha = 0.82;
    ctx.font = `italic 400 40px ${serif}`;
    ctx.fillText(spec.author, STORY_WIDTH / 2, endY + 20);
    ctx.globalAlpha = 1;
  }
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to render image"))),
      "image/png",
    );
  });
}

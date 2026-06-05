import { STORY_WIDTH, STORY_HEIGHT } from "./dimensions";
import { wrapText, clampLines } from "./text";
import type { CoverPalette } from "../cover";

/**
 * Client-only renderer that paints a share card onto a 1080×1920 canvas. Uses
 * Georgia (a universally available serif) so the image renders identically
 * everywhere with no web-font loading race — the size and look never "miss".
 */
export type StorySpec =
  | { kind: "quote"; text: string; attribution: string; palette: CoverPalette }
  | { kind: "streak"; current: number; longest: number; palette: CoverPalette }
  | { kind: "book"; title: string; author: string; initials: string; palette: CoverPalette };

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

function paintWordmark(ctx: CanvasRenderingContext2D, palette: CoverPalette) {
  ctx.fillStyle = palette.fg;
  ctx.globalAlpha = 0.92;
  ctx.font = `italic 600 56px ${SERIF}`;
  ctx.textAlign = "center";
  ctx.fillText("goread", STORY_WIDTH / 2, 150);
  ctx.globalAlpha = 0.7;
  ctx.font = `400 26px ${SERIF}`;
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

export function renderStory(canvas: HTMLCanvasElement, spec: StorySpec): void {
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { palette } = spec;

  paintBackground(ctx, palette);
  paintWordmark(ctx, palette);
  ctx.fillStyle = palette.fg;
  ctx.textAlign = "center";

  if (spec.kind === "quote") {
    const maxW = STORY_WIDTH - PAD * 2;
    const fontSize = spec.text.length > 240 ? 60 : spec.text.length > 120 ? 72 : 88;
    ctx.font = `500 ${fontSize}px ${SERIF}`;
    const measure = (t: string) => ctx.measureText(t).width;
    const lines = clampLines(wrapText(`“${spec.text}”`, maxW, measure), 12);
    const lineHeight = fontSize * 1.32;
    const blockHeight = lines.length * lineHeight;
    const startY = STORY_HEIGHT / 2 - blockHeight / 2;
    const endY = paintLines(ctx, lines, startY, lineHeight);
    ctx.globalAlpha = 0.85;
    ctx.font = `italic 400 38px ${SERIF}`;
    ctx.fillText(spec.attribution, STORY_WIDTH / 2, endY + 70);
    ctx.globalAlpha = 1;
  } else if (spec.kind === "streak") {
    ctx.font = `600 360px ${SERIF}`;
    ctx.fillText(String(spec.current), STORY_WIDTH / 2, STORY_HEIGHT / 2 + 60);
    ctx.font = `500 64px ${SERIF}`;
    ctx.fillText(
      spec.current === 1 ? "day reading streak" : "days reading streak",
      STORY_WIDTH / 2,
      STORY_HEIGHT / 2 + 200,
    );
    ctx.globalAlpha = 0.8;
    ctx.font = `400 40px ${SERIF}`;
    ctx.fillText(`Longest: ${spec.longest} days`, STORY_WIDTH / 2, STORY_HEIGHT / 2 + 280);
    ctx.globalAlpha = 1;
  } else {
    // book
    const cw = 460;
    const ch = 690;
    const cx = STORY_WIDTH / 2 - cw / 2;
    const cy = STORY_HEIGHT / 2 - ch / 2 - 60;
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = palette.fg;
    roundRect(ctx, cx, cy, cw, ch, 18);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = palette.fg;
    ctx.font = `600 200px ${SERIF}`;
    ctx.fillText(spec.initials, STORY_WIDTH / 2, cy + ch / 2 + 70);

    const maxW = STORY_WIDTH - PAD * 2;
    ctx.font = `600 64px ${SERIF}`;
    const measure = (t: string) => ctx.measureText(t).width;
    const titleLines = clampLines(wrapText(spec.title, maxW, measure), 3);
    const titleY = cy + ch + 90;
    const endY = paintLines(ctx, titleLines, titleY, 76);
    ctx.globalAlpha = 0.82;
    ctx.font = `italic 400 40px ${SERIF}`;
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

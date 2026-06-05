// Rasterize public/icon.svg into the PNG sizes the PWA manifest + iOS need.
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "public", "icon.svg"));

const targets = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "apple-icon.png", size: 180, bg: "#b45309" },
];

// Maskable: extra padding so the glyph stays inside the safe zone.
const maskable = { file: "maskable-512.png", size: 512, pad: 64, bg: "#b45309" };

for (const t of targets) {
  await sharp(svg, { density: 384 })
    .resize(t.size, t.size, { fit: "contain", background: t.bg ?? { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(root, "public", t.file));
  console.log("wrote", t.file);
}

const inner = maskable.size - maskable.pad * 2;
const glyph = await sharp(svg, { density: 384 }).resize(inner, inner).png().toBuffer();
await sharp({
  create: { width: maskable.size, height: maskable.size, channels: 4, background: maskable.bg },
})
  .composite([{ input: glyph, top: maskable.pad, left: maskable.pad }])
  .png()
  .toFile(join(root, "public", maskable.file));
console.log("wrote", maskable.file);

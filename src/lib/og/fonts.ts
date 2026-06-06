import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

/**
 * Satori (next/og) accepts TTF / OTF / WOFF — NOT woff2 or variable fonts.
 * The static `new URL(..., import.meta.url)` references let Vercel's file
 * tracer bundle these .woff files into the OG route's serverless function.
 */
const read = (url: URL) => readFile(fileURLToPath(url));

export type OgFont = {
  name: string;
  data: Buffer;
  weight: 400 | 500 | 600 | 700;
  style: "normal";
};

let cache: OgFont[] | null = null;

export async function ogFonts(): Promise<OgFont[]> {
  if (cache) return cache;
  const [playfair700, playfair500, inter500, inter600] = await Promise.all([
    read(new URL("./fonts/playfair-700.woff", import.meta.url)),
    read(new URL("./fonts/playfair-500.woff", import.meta.url)),
    read(new URL("./fonts/inter-500.woff", import.meta.url)),
    read(new URL("./fonts/inter-600.woff", import.meta.url)),
  ]);
  cache = [
    { name: "Playfair Display", data: playfair700, weight: 700, style: "normal" },
    { name: "Playfair Display", data: playfair500, weight: 500, style: "normal" },
    { name: "Inter", data: inter500, weight: 500, style: "normal" },
    { name: "Inter", data: inter600, weight: 600, style: "normal" },
  ];
  return cache;
}

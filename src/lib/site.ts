/** Canonical site config + the marketing copy used across metadata, OG, JSON-LD. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://goread.fun").replace(
  /\/$/,
  "",
);
export const SITE_NAME = "goread";

/** Short, confident, no feature-dump. */
export const SITE_TITLE = "goread — every classic, free";

/** Meta description — the hook plus just enough for a clean SERP snippet. */
export const SITE_DESCRIPTION =
  "Every classic, free. 70,000 timeless books, beautiful to read on any device.";

/** Copy used inside the social share image. */
export const OG_HEADLINE = "Every classic.\nFree.";
export const OG_SUB = "70,000 timeless books, beautiful to read.";

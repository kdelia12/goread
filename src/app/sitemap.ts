import type { MetadataRoute } from "next";
import { FIXTURE_CATALOGUE } from "@/lib/gutendex";
import { GENRES } from "@/lib/genres";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://goread.fun";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/gutenberg`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // SEO landing pages — genre, comparison, and feature/device guides. Each is a
  // hand-written static page targeting a specific search intent.
  const landingSlugs = [
    "gothic-novels",
    "russian-literature",
    "victorian-novels",
    "classic-romance",
    "dystopian-classics",
    "standard-ebooks-alternative",
    "manybooks-alternative",
    "serial-reader-alternative",
    "dark-mode-ebook-reader",
    "eink-reader-online",
    "read-classics-on-iphone",
    "ebook-reader-for-ipad-free",
  ];
  const landingPages: MetadataRoute.Sitemap = landingSlugs.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const genrePages: MetadataRoute.Sitemap = GENRES.map((g) => ({
    url: `${SITE_URL}/search?topic=${encodeURIComponent(g.topic)}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const bookPages: MetadataRoute.Sitemap = FIXTURE_CATALOGUE.map((b) => ({
    url: `${SITE_URL}/book/${b.id}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...landingPages, ...genrePages, ...bookPages];
}

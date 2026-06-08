import type { Metadata } from "next";
import { MousePointerClick, Library, Palette } from "lucide-react";
import { POPULAR_CLASSICS } from "@/lib/collections";
import { LandingJsonLd } from "@/components/json-ld";
import {
  LandingShell,
  LandingHero,
  LandingBooks,
  LandingProse,
  LandingFeatures,
  LandingFaqs,
  LandingRelated,
  LandingCta,
} from "@/components/seo/landing";

const TITLE = "A free Standard Ebooks alternative";
const DESCRIPTION =
  "Love Standard Ebooks but want to read in the browser instead of downloading files? goread opens the whole Project Gutenberg library instantly — free, no sign-up, no EPUB to manage.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/standard-ebooks-alternative" },
  openGraph: { type: "website", title: `${TITLE} — goread`, description: DESCRIPTION, url: "/standard-ebooks-alternative" },
};

const FAQ = [
  {
    q: "Is goread the same as Standard Ebooks?",
    a: "No — they're different by design. Standard Ebooks hand-perfects a curated collection of EPUB files for you to download. goread is a reader: it opens the entire Project Gutenberg catalogue right in your browser, with no file to download or sideload.",
  },
  {
    q: "Can goread open the EPUBs I downloaded from Standard Ebooks?",
    a: "goread doesn't import your own files — it opens the Project Gutenberg edition of each book. Since Standard Ebooks builds on Project Gutenberg texts, the same titles are here, ready to read instantly (in the Gutenberg edition rather than the Standard Ebooks typesetting).",
  },
  {
    q: "Does it cost anything?",
    a: "No. goread is free and the books are public domain. There's no subscription and no account required to read.",
  },
];

export default function StandardEbooksAlternativePage() {
  return (
    <LandingShell>
      <LandingJsonLd path="/standard-ebooks-alternative" name="A free Standard Ebooks alternative" description={DESCRIPTION} faq={FAQ} />

      <LandingHero
        eyebrow="The same classics · in your browser"
        title="A free, read-in-the-browser alternative to Standard Ebooks"
        lede={
          <>
            Standard Ebooks makes gorgeous, meticulously typeset public-domain files — to download.
            goread takes the other path: <strong className="text-fg">open any classic instantly in
            your browser</strong>, no EPUB to fetch, no app to sideload, the whole of Project
            Gutenberg a tap away.
          </>
        }
        primary={{ href: "/search", label: "Find a book" }}
        secondary={{ href: "/gutenberg", label: "How goread works" }}
      />

      <LandingProse title="Two good answers to the same problem">
        <p>
          Standard Ebooks is a labour of love — volunteers re-typesetting the classics into files
          that look hand-made, then handing them to you to load onto your device. If you want a
          flawless EPUB to keep, it&rsquo;s wonderful.
        </p>
        <p>
          goread is for the other moment — when you just want to <em>read</em>. No download, no
          transfer, no format wrangling. Search a title, tap the cover, and you&rsquo;re on page one,
          with reading themes, bookmarks and your place kept across devices.
        </p>
      </LandingProse>

      <LandingFeatures
        title="What you get with goread"
        items={[
          { icon: MousePointerClick, title: "Read instantly", body: "No file to download or sideload — tap a cover and the book opens in your browser on any device." },
          { icon: Library, title: "The whole library", body: "Around 70,000 Project Gutenberg titles, not a curated few hundred — if it's public domain, it's probably here." },
          { icon: Palette, title: "A reader, not just a file", body: "Five themes, editorial typography, bookmarks, streaks, and quote-to-Story — all built in." },
        ]}
      />

      <LandingBooks title="Start with a classic" subtitle="The most-read titles, ready to open right now." books={POPULAR_CLASSICS} />

      <LandingFaqs items={FAQ} />

      <LandingRelated
        links={[
          { href: "/manybooks-alternative", label: "vs ManyBooks" },
          { href: "/serial-reader-alternative", label: "vs Serial Reader" },
          { href: "/gutenberg", label: "Read Project Gutenberg" },
          { href: "/gothic-novels", label: "Gothic novels" },
          { href: "/dark-mode-ebook-reader", label: "Dark-mode reader" },
          { href: "/eink-reader-online", label: "E-ink reader" },
        ]}
      />

      <LandingCta
        title="Just want to read?"
        body="Open ~70,000 Project Gutenberg classics in your browser — free, no sign-up, nothing to download."
        href="/search"
        label="Browse the library"
      />
    </LandingShell>
  );
}

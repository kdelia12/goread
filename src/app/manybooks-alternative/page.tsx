import type { Metadata } from "next";
import { Ban, BookOpen, Sparkles } from "lucide-react";
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

const TITLE = "A free ManyBooks alternative";
const DESCRIPTION =
  "Want free classics without the ads or the downloads? goread opens the Project Gutenberg library — around 70,000 classics — in your browser, with no account, no clutter, just the book and a beautiful page.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/manybooks-alternative" },
  openGraph: { type: "website", title: `${TITLE} — goread`, description: DESCRIPTION, url: "/manybooks-alternative" },
};

const FAQ = [
  {
    q: "How is goread different from ManyBooks?",
    a: "ManyBooks is a download library — you pick a format and save a file. goread is a reader: classics open straight in your browser, with no ads and no account, and you read them right there.",
  },
  {
    q: "Are there ads?",
    a: "None. goread doesn't run ads or sponsored placements. The reading page is just the text and your controls.",
  },
  {
    q: "Do I have to choose a file format?",
    a: "No formats, no downloads, no decisions. Tap a cover and start reading. If you want it offline, install goread to your home screen and it keeps working without a connection.",
  },
];

export default function ManyBooksAlternativePage() {
  return (
    <LandingShell>
      <LandingJsonLd path="/manybooks-alternative" name="A free ManyBooks alternative" description={DESCRIPTION} faq={FAQ} />

      <LandingHero
        eyebrow="Free classics · no clutter"
        title="A cleaner ManyBooks alternative — read in your browser"
        lede={
          <>
            If you came to ManyBooks for free classics but bounced off the downloads and the ads,
            goread is the calm version: <strong className="text-fg">no ads, no account, nothing to
            download</strong> — just the book, opening instantly in your browser.
          </>
        }
        primary={{ href: "/search", label: "Find a book" }}
        secondary={{ href: "/gutenberg", label: "How goread works" }}
      />

      <LandingProse title="Less to get through, more to read">
        <p>
          A download library asks a lot before you read a word: pick a format, save the file, move it
          to the right app, dodge the ads on the way out. For a free classic, that&rsquo;s a lot of
          friction.
        </p>
        <p>
          goread cuts all of it. Search the title, tap the cover, read. The page is clean by
          principle — no ads, no upsells, no newsletter wall — and your place, bookmarks and theme
          follow you from phone to laptop.
        </p>
      </LandingProse>

      <LandingFeatures
        title="What you get with goread"
        items={[
          { icon: Ban, title: "No ads, ever", body: "No banners, no pop-ups, no sponsored rows — the reading page stays the reading page." },
          { icon: BookOpen, title: "Nothing to download", body: "Classics open in the browser. No file format to choose, no transfer to a reading app." },
          { icon: Sparkles, title: "A real reading experience", body: "Five themes, editorial type, bookmarks, reading streaks and quote-to-Story, all built in." },
        ]}
      />

      <LandingBooks title="Open one now" subtitle="The most-read classics, ready in your browser." books={POPULAR_CLASSICS} />

      <LandingFaqs items={FAQ} />

      <LandingRelated
        links={[
          { href: "/standard-ebooks-alternative", label: "vs Standard Ebooks" },
          { href: "/serial-reader-alternative", label: "vs Serial Reader" },
          { href: "/gutenberg", label: "Read Project Gutenberg" },
          { href: "/dystopian-classics", label: "Dystopian classics" },
          { href: "/read-classics-on-iphone", label: "Read on iPhone" },
          { href: "/ebook-reader-for-ipad-free", label: "Reader for iPad" },
        ]}
      />

      <LandingCta
        title="Free classics, minus the clutter"
        body="Open ~70,000 free Project Gutenberg classics in your browser — no ads, no account, no downloads."
        href="/search"
        label="Browse the library"
      />
    </LandingShell>
  );
}

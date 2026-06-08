import type { Metadata } from "next";
import { BookOpen, Battery, WifiOff } from "lucide-react";
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

const TITLE = "E-ink ebook reader online, free";
const DESCRIPTION =
  "A free online reader with a paper-like e-ink theme — read classics in your Kindle, Kobo or phone browser with low-contrast, glare-free type. No download, no sign-up.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/eink-reader-online" },
  openGraph: { type: "website", title: `${TITLE} — goread`, description: DESCRIPTION, url: "/eink-reader-online" },
};

const FAQ = [
  {
    q: "Does goread work in a Kindle or Kobo browser?",
    a: "goread is a website, so it opens in the browser on a Kobo and other modern e-readers — switch to the e-ink theme for high-legibility, low-contrast type that suits the screen. On a Kindle's basic experimental browser, results vary by model, so treat it as best-effort there.",
  },
  {
    q: "What makes the e-ink theme different?",
    a: "It drops the contrast and the glow: a soft paper-coloured background, plain near-black type, and no animation flourishes that would smear on a slow-refresh e-ink panel.",
  },
  {
    q: "Can I read offline on my e-reader?",
    a: "Once a book is open it keeps reading without a connection, and installing goread to the home screen caches the reader for offline use where the device supports it.",
  },
];

export default function EinkReaderPage() {
  return (
    <LandingShell>
      <LandingJsonLd path="/eink-reader-online" name="E-ink reader online" description={DESCRIPTION} faq={FAQ} />

      <LandingHero
        eyebrow="Paper-like, glare-free"
        title="A free e-ink reader, right in your browser"
        lede={
          <>
            E-ink screens want calm, high-legibility pages — not bright UI and motion. goread is a
            free e-ink reader you use online, with a dedicated{" "}
            <strong className="text-fg">e-ink theme</strong> built for exactly that — so the classics
            look like print on a Kobo, a tablet, or any low-glow screen.
          </>
        }
        primary={{ href: "/search", label: "Pick a book" }}
        secondary={{ href: "/gutenberg", label: "How goread works" }}
      />

      <LandingProse title="Designed for the slow, perfect screen">
        <p>
          E-ink is the closest a screen gets to paper — and it punishes the things the modern web
          loves: heavy contrast, animation, glowing whites. goread&rsquo;s e-ink theme strips those
          away, leaving a soft, paper-toned page and steady near-black type that doesn&rsquo;t smear
          when the panel refreshes.
        </p>
        <p>
          Because goread runs in a browser, there&rsquo;s nothing to sideload onto the device — open
          the site, choose the e-ink theme, and read.
        </p>
      </LandingProse>

      <LandingFeatures
        title="Why it suits e-ink"
        items={[
          { icon: BookOpen, title: "Low-contrast page", body: "Paper-toned background and plain type — high legibility without the harsh white of a typical screen." },
          { icon: Battery, title: "Calm, static layout", body: "Minimal motion and a simple column, so nothing ghosts or smears on a slow-refresh display." },
          { icon: WifiOff, title: "Reads offline", body: "Install to the home screen and the reader keeps working without a connection, where the device allows it." },
        ]}
      />

      <LandingBooks title="Open one in e-ink" subtitle="Pick a classic and switch to the e-ink theme in the reader." books={POPULAR_CLASSICS} />

      <LandingFaqs items={FAQ} />

      <LandingRelated
        links={[
          { href: "/dark-mode-ebook-reader", label: "Dark-mode reader" },
          { href: "/read-classics-on-iphone", label: "Read on iPhone" },
          { href: "/ebook-reader-for-ipad-free", label: "Reader for iPad" },
          { href: "/standard-ebooks-alternative", label: "vs Standard Ebooks" },
          { href: "/victorian-novels", label: "Victorian novels" },
          { href: "/gutenberg", label: "Read Project Gutenberg" },
        ]}
      />

      <LandingCta
        title="Read like it's printed"
        body="Open any classic, switch to the e-ink theme, and let the screen do its best impression of paper."
        href="/search"
        label="Browse the library"
      />
    </LandingShell>
  );
}

import type { Metadata } from "next";
import { Tablet, Columns, WifiOff, Palette } from "lucide-react";
import { POPULAR_CLASSICS } from "@/lib/collections";
import { LandingJsonLd } from "@/components/json-ld";
import {
  LandingShell,
  LandingHero,
  LandingBooks,
  LandingSteps,
  LandingFeatures,
  LandingFaqs,
  LandingRelated,
  LandingCta,
} from "@/components/seo/landing";

const TITLE = "Free ebook reader for iPad";
const DESCRIPTION =
  "A free ebook reader for iPad — open 70,000 classics in Safari, add goread to your home screen, and read full-screen with a big, comfortable page. No App Store, no sign-up.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/ebook-reader-for-ipad-free" },
  openGraph: { type: "website", title: `${TITLE} — goread`, description: DESCRIPTION, url: "/ebook-reader-for-ipad-free" },
};

const STEPS = [
  { title: "Open goread in Safari", body: "Visit goread.fun in Safari on your iPad and open a book to set your theme and type size." },
  { title: "Tap Share, then Add to Home Screen", body: "Use the Share icon in the toolbar and choose “Add to Home Screen.” goread shows you exactly where to tap." },
  { title: "Read full-screen", body: "Launch from the icon for a full-screen reader with no browser chrome — the page gets the whole iPad." },
];

const FAQ = [
  {
    q: "Is there an iPad app to download?",
    a: "No download needed. goread installs straight from Safari as a Progressive Web App, so it lives on your home screen and runs full-screen without the App Store.",
  },
  {
    q: "Does the big screen actually help?",
    a: "A lot. goread sets a comfortable reading measure and large, adjustable type, so the iPad's screen gives you a calm, book-like page rather than a stretched phone layout.",
  },
  {
    q: "Can I read offline?",
    a: "Yes — once installed, an opened book keeps reading without a connection, so the iPad is ready for a flight or a weekend off-grid.",
  },
];

export default function IpadReaderPage() {
  return (
    <LandingShell>
      <LandingJsonLd path="/ebook-reader-for-ipad-free" name="Free ebook reader for iPad" description={DESCRIPTION} faq={FAQ} />

      <LandingHero
        eyebrow="iPad · no App Store"
        title="A free ebook reader for iPad"
        lede={
          <>
            For reading, the iPad&rsquo;s screen is hard to beat — so give it the whole library. Add
            goread from Safari and you get <strong className="text-fg">70,000 classics on a big,
            comfortable, full-screen page</strong>, free and offline-ready.
          </>
        }
        primary={{ href: "/search", label: "Find a book" }}
        secondary={{ href: "/gutenberg", label: "How goread works" }}
      />

      <LandingSteps
        title="Install goread on your iPad"
        subtitle="Add it from Safari and read full-screen — no App Store."
        steps={STEPS}
      />

      <LandingFeatures
        title="Reading that earns the screen"
        items={[
          { icon: Tablet, title: "Full-screen, app-like", body: "From the home-screen icon, goread fills the iPad with no Safari bars — just the book." },
          { icon: Columns, title: "A comfortable measure", body: "Big, adjustable type and a sensible line length, so the wide screen reads like a page, not a billboard." },
          { icon: Palette, title: "Five reading themes", body: "Daylight, paper, sepia, midnight and e-ink — set the page to the room you're in." },
          { icon: WifiOff, title: "Offline-ready", body: "Install once and an opened book keeps reading with no Wi-Fi — perfect for travel." },
        ]}
      />

      <LandingBooks title="Open one on your iPad" subtitle="Tap a cover to start — install from Safari whenever you like." books={POPULAR_CLASSICS} />

      <LandingFaqs items={FAQ} />

      <LandingRelated
        links={[
          { href: "/read-classics-on-iphone", label: "Read on iPhone" },
          { href: "/dark-mode-ebook-reader", label: "Dark-mode reader" },
          { href: "/eink-reader-online", label: "E-ink reader" },
          { href: "/victorian-novels", label: "Victorian novels" },
          { href: "/gutenberg", label: "Read Project Gutenberg" },
        ]}
      />

      <LandingCta
        title="Turn your iPad into a library"
        body="Add goread to your home screen and your iPad becomes a calm, full-page reading device — free and offline-ready."
        href="/search"
        label="Browse the library"
      />
    </LandingShell>
  );
}

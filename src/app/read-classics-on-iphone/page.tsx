import type { Metadata } from "next";
import { Palette, Smartphone, WifiOff, LogIn } from "lucide-react";
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

const TITLE = "Read classics on iPhone, free";
const DESCRIPTION =
  "Read 70,000 free classics on your iPhone — no App Store, no account. Add goread to your home screen from Safari and it opens full-screen, works offline, and keeps your place.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/read-classics-on-iphone" },
  openGraph: { type: "website", title: `${TITLE} — goread`, description: DESCRIPTION, url: "/read-classics-on-iphone" },
};

const STEPS = [
  { title: "Open goread in Safari", body: "Go to goread.fun in Safari on your iPhone. Find a book and check it reads the way you like." },
  { title: "Tap the Share button", body: "It's the square-with-an-arrow icon in Safari's toolbar. goread will point right at it the first time." },
  { title: "Add to Home Screen", body: "Scroll the share sheet and tap “Add to Home Screen,” then Add. A goread icon lands on your home screen." },
  { title: "Open it like an app", body: "Launch from the icon and goread runs full-screen with no Safari bars — and you stay signed in." },
];

const FAQ = [
  {
    q: "Is this a real app from the App Store?",
    a: "It's a Progressive Web App — the modern way to install a website. There's no App Store download; you add it from Safari and it behaves like a native app, full-screen and on your home screen.",
  },
  {
    q: "Will it work offline on the subway or a flight?",
    a: "Yes. Once installed, the reader is cached, so a book you've opened keeps reading with no signal.",
  },
  {
    q: "Do I stay signed in after I install it?",
    a: "You do. If you signed in before adding goread to your home screen, the installed app keeps you signed in — your library, bookmarks and place are right there.",
  },
];

export default function ReadOnIphonePage() {
  return (
    <LandingShell>
      <LandingJsonLd path="/read-classics-on-iphone" name="Read classics on iPhone" description={DESCRIPTION} faq={FAQ} />

      <LandingHero
        eyebrow="iPhone · no App Store"
        title="Read the classics on your iPhone, free"
        lede={
          <>
            No app to download, no account to read. Add goread to your home screen from Safari and you
            get <strong className="text-fg">70,000 classics in a full-screen reader</strong> that works
            offline and remembers exactly where you stopped.
          </>
        }
        primary={{ href: "/search", label: "Find a book" }}
        secondary={{ href: "/gutenberg", label: "How goread works" }}
      />

      <LandingSteps
        title="Add goread to your home screen"
        subtitle="Thirty seconds in Safari and you have an app-like reader."
        steps={STEPS}
      />

      <LandingFeatures
        title="Made for reading on a phone"
        items={[
          { icon: Smartphone, title: "Full-screen reader", body: "Launched from the home screen, goread fills the display — no address bar, no toolbars, just the page." },
          { icon: WifiOff, title: "Works offline", body: "Cached after install, so an opened book keeps reading on the train or a flight." },
          { icon: Palette, title: "Five themes & big type", body: "Midnight, sepia, e-ink and more, with adjustable size — comfortable one-handed reading, day or night." },
          { icon: LogIn, title: "Stays signed in", body: "Sign in once before installing and the home-screen app keeps your library and place in sync." },
        ]}
      />

      <LandingBooks title="Start on your phone" subtitle="Tap a cover and start reading — install whenever you're ready." books={POPULAR_CLASSICS} />

      <LandingFaqs items={FAQ} />

      <LandingRelated
        links={[
          { href: "/ebook-reader-for-ipad-free", label: "Reader for iPad" },
          { href: "/dark-mode-ebook-reader", label: "Dark-mode reader" },
          { href: "/eink-reader-online", label: "E-ink reader" },
          { href: "/serial-reader-alternative", label: "vs Serial Reader" },
          { href: "/classic-romance", label: "Classic romance" },
          { href: "/gutenberg", label: "Read Project Gutenberg" },
        ]}
      />

      <LandingCta
        title="Put a library in your pocket"
        body="Add goread to your home screen and the commute, the queue and the waiting room all turn into reading time."
        href="/search"
        label="Browse the library"
      />
    </LandingShell>
  );
}

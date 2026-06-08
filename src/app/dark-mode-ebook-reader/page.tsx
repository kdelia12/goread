import type { Metadata } from "next";
import Link from "next/link";
import { Moon, Sun, Eye, Type } from "lucide-react";
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

const TITLE = "Dark-mode ebook reader, free";
const DESCRIPTION =
  "A free online ebook reader with a true dark mode — read 70,000 classics in a warm midnight theme that's easy on the eyes at night. No download, no sign-up.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/dark-mode-ebook-reader" },
  openGraph: { type: "website", title: `${TITLE} — goread`, description: DESCRIPTION, url: "/dark-mode-ebook-reader" },
};

const FAQ = [
  {
    q: "Is the dark mode a real dark theme or just an inverted page?",
    a: "It's a designed theme, not an invert. Midnight mode uses a warm near-black background and a soft off-white type colour, tuned for contrast that's comfortable rather than glaring.",
  },
  {
    q: "Will it follow my phone's dark mode automatically?",
    a: "Yes — set the theme to System and goread matches your device's light or dark setting, then switches with it. You can also lock it to one theme any time from the reader.",
  },
  {
    q: "Why not just use my phone's system dark mode?",
    a: "System dark mode darkens menus and apps, but a book still needs a reading palette of its own. Midnight mode is designed for the page itself — the right black, the right off-white, the right warmth — rather than a blanket inversion.",
  },
];

export default function DarkModeReaderPage() {
  return (
    <LandingShell>
      <LandingJsonLd path="/dark-mode-ebook-reader" name="Dark-mode ebook reader" description={DESCRIPTION} faq={FAQ} />

      <LandingHero
        eyebrow="Reads great at night"
        title="A free ebook reader with a true dark mode"
        lede={
          <>
            goread is a free dark mode ebook reader — the real kind. Most{" "}
            &ldquo;dark modes&rdquo; just invert the page and call it done; goread ships a{" "}
            <strong className="text-fg">warm midnight theme tuned for late-night reading</strong>,
            across the whole 70,000-book Project Gutenberg library.
          </>
        }
        primary={{ href: "/search", label: "Pick a book" }}
        secondary={{ href: "/gutenberg", label: "How goread works" }}
      />

      <LandingProse title="A dark mode that's actually designed">
        <p>
          A real dark mode isn&rsquo;t an inverted page — it&rsquo;s a palette. goread&rsquo;s{" "}
          <em>Midnight</em> theme pairs a warm near-black background with soft off-white type, the
          kind of contrast you can read by for hours without the 1&nbsp;a.m. glare. Set it to System
          and it arrives the moment your phone goes dark.
        </p>
        <p>
          It&rsquo;s one of five reading themes — Daylight, Paper, Sepia, Midnight, and a paper-like{" "}
          <Link href="/eink-reader-online" className="text-accent underline">
            e-ink mode
          </Link>{" "}
          for actual e-readers — and the switch lives right in the reader, a tap away mid-chapter.
        </p>
      </LandingProse>

      <LandingFeatures
        title="Built for the eyes, not just the brand"
        items={[
          { icon: Moon, title: "Warm midnight mode", body: "Near-black, never pure black — paired with soft off-white type for contrast you can sit with for hours." },
          { icon: Sun, title: "Auto light & dark", body: "Match your system theme and switch automatically when your phone does at sunset." },
          { icon: Eye, title: "Kind to tired eyes", body: "No glaring white page at midnight — just a calm, low-glow surface that won't fight your sleep." },
          { icon: Type, title: "Tune the type, too", body: "Adjust size, line height and margins so the page is comfortable, not just correctly coloured." },
        ]}
      />

      <LandingBooks title="Try it on a classic" subtitle="Open one and switch to midnight from the reader." books={POPULAR_CLASSICS} />

      <LandingFaqs items={FAQ} />

      <LandingRelated
        links={[
          { href: "/eink-reader-online", label: "E-ink reader" },
          { href: "/read-classics-on-iphone", label: "Read on iPhone" },
          { href: "/ebook-reader-for-ipad-free", label: "Reader for iPad" },
          { href: "/manybooks-alternative", label: "vs ManyBooks" },
          { href: "/gothic-novels", label: "Gothic novels" },
          { href: "/gutenberg", label: "Read Project Gutenberg" },
        ]}
      />

      <LandingCta
        title="Read into the night"
        body="Flip any classic to midnight mode and read until the small hours, easy on the eyes."
        href="/search"
        label="Browse the library"
      />
    </LandingShell>
  );
}

import type { Metadata } from "next";
import { Gauge, Flame, Globe } from "lucide-react";
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

const TITLE = "A free Serial Reader alternative";
const DESCRIPTION =
  "Love the daily-classic habit but not the app or the drip-feed? goread gives you the same classics in your browser — read a chapter or the whole book, keep a streak, free and no install.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/serial-reader-alternative" },
  openGraph: { type: "website", title: `${TITLE} — goread`, description: DESCRIPTION, url: "/serial-reader-alternative" },
};

const FAQ = [
  {
    q: "What's the difference from Serial Reader?",
    a: "Serial Reader portions a classic into a daily issue you read in about ten minutes. goread gives you the same classics with no rationing — read a single chapter today or stay up for the whole thing — and keeps a reading streak if you like the daily-habit part.",
  },
  {
    q: "Is there a daily-habit feature?",
    a: "Yes. goread tracks a reading streak so you can keep the satisfying every-day rhythm. The difference is you set the pace, not the app.",
  },
  {
    q: "Do I need to install an app?",
    a: "No. goread runs in any browser. You can add it to your home screen for a one-tap, app-like experience, but there's nothing to install from a store and no account required to start.",
  },
];

export default function SerialReaderAlternativePage() {
  return (
    <LandingShell>
      <LandingJsonLd path="/serial-reader-alternative" name="A free Serial Reader alternative" description={DESCRIPTION} faq={FAQ} />

      <LandingHero
        eyebrow="The daily classic · your pace"
        title="A browser alternative to Serial Reader"
        lede={
          <>
            Serial Reader&rsquo;s daily-bite habit is a lovely idea. goread keeps the habit and drops
            the rationing: <strong className="text-fg">read one chapter or finish the book tonight</strong>,
            keep a streak if you want one, all free and right in your browser.
          </>
        }
        primary={{ href: "/search", label: "Pick a classic" }}
        secondary={{ href: "/gutenberg", label: "How goread works" }}
      />

      <LandingProse title="Keep the habit, lose the drip">
        <p>
          A daily issue is a brilliant way to finally get through <em>Moby-Dick</em> — until the day
          you&rsquo;re hooked and the app makes you wait until tomorrow. The discipline is the good
          part; the cap isn&rsquo;t.
        </p>
        <p>
          goread gives you the same classics and the same daily rhythm — a reading streak, your place
          kept, a chapter-sized session whenever you want one — but the brakes are off. Some nights
          you read ten minutes. Some nights you read until 2&nbsp;a.m. Both should be allowed.
        </p>
      </LandingProse>

      <LandingFeatures
        title="The best of both habits"
        items={[
          { icon: Gauge, title: "Read at your pace", body: "A chapter, an hour, or the whole book — no daily cap, no waiting for the next issue." },
          { icon: Flame, title: "Keep a streak", body: "goread tracks your reading streak, so the daily-habit magic is still there if you want it." },
          { icon: Globe, title: "No app required", body: "Runs in any browser and installs to your home screen — no store download, no account to start." },
        ]}
      />

      <LandingBooks title="Begin a classic today" subtitle="The most-read titles, ready in your browser." books={POPULAR_CLASSICS} />

      <LandingFaqs items={FAQ} />

      <LandingRelated
        links={[
          { href: "/standard-ebooks-alternative", label: "vs Standard Ebooks" },
          { href: "/manybooks-alternative", label: "vs ManyBooks" },
          { href: "/gutenberg", label: "Read Project Gutenberg" },
          { href: "/read-classics-on-iphone", label: "Read on iPhone" },
          { href: "/victorian-novels", label: "Victorian novels" },
        ]}
      />

      <LandingCta
        title="The daily classic, on your terms"
        body="Keep the streak, skip the rationing — open a classic in your browser, free and no install."
        href="/search"
        label="Browse the library"
      />
    </LandingShell>
  );
}

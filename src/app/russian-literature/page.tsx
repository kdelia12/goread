import type { Metadata } from "next";
import { Snowflake, BookOpen, Layers } from "lucide-react";
import { RUSSIAN_LITERATURE } from "@/lib/collections";
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

const TITLE = "Russian literature, free to read online";
const DESCRIPTION =
  "Tolstoy, Dostoevsky, Gogol, Turgenev — the great Russian novels, free in your browser on goread. War and Peace to Crime and Punishment, no download required.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/russian-literature" },
  openGraph: { type: "website", title: `${TITLE} — goread`, description: DESCRIPTION, url: "/russian-literature" },
};

const FAQ = [
  {
    q: "Which translations are these?",
    a: "The classic public-domain English translations — Constance Garnett's Dostoevsky and Turgenev, the Maude translations of Tolstoy, and their contemporaries. These are the versions that carried the Russian greats into English, free to read in full.",
  },
  {
    q: "Is War and Peace really readable on a phone?",
    a: "It is. goread keeps your exact place across sessions and devices, and an optional continuous-scroll mode lets the whole book flow as one unbroken column. Long novels are where a good reader earns its keep.",
  },
  {
    q: "Do I need an account to read?",
    a: "No. Start reading as a guest. A free account is only there if you want your place and bookmarks to follow you to another device.",
  },
];

export default function RussianLiteraturePage() {
  return (
    <LandingShell>
      <LandingJsonLd path="/russian-literature" name="Russian literature" description={DESCRIPTION} collection books={RUSSIAN_LITERATURE} faq={FAQ} />

      <LandingHero
        eyebrow="Russian classics · free"
        title="Russian literature, free to read online"
        lede={
          <>
            Russian literature goes all the way down — guilt, faith, a whole society at war, a man
            arguing with himself in a basement. The nineteenth-century canon is the deep end of the
            novel, and <strong className="text-fg">every one of these is free</strong> to read in
            your browser.
          </>
        }
        primary={{ href: "/book/2554", label: "Read Crime and Punishment" }}
        secondary={{ href: "/gutenberg", label: "How goread works" }}
      />

      <LandingBooks
        title="The great Russian novels"
        subtitle="Tolstoy, Dostoevsky, Gogol and Turgenev — the canon, in full."
        books={RUSSIAN_LITERATURE}
      />

      <LandingProse title="Why start here">
        <p>
          No other tradition asks bigger questions in plainer rooms. Dostoevsky puts a murder on page
          one and spends four hundred pages on the conscience behind it. Tolstoy sets five families
          against Napoleon and somehow makes a ballroom feel as vast as a battlefield. Gogol laughs at
          a whole empire; Turgenev quietly breaks your heart over a generation gap.
        </p>
        <p>
          They&rsquo;re long, they&rsquo;re famously intimidating — and they&rsquo;re free. That&rsquo;s
          the best possible excuse to finally begin.
        </p>
      </LandingProse>

      <LandingFeatures
        title="Made for the long ones"
        items={[
          { icon: Layers, title: "Continuous scroll", body: "Turn the whole book into one unbroken column — ideal for a novel that runs to a thousand pages." },
          { icon: BookOpen, title: "Your place, kept", body: "Close the tab mid-chapter and reopen exactly where you stopped, on any device." },
          { icon: Snowflake, title: "Calm, readable type", body: "Five themes and adjustable size and spacing, so a dense Russian page never feels like a wall." },
        ]}
      />

      <LandingFaqs items={FAQ} />

      <LandingRelated
        links={[
          { href: "/victorian-novels", label: "Victorian novels" },
          { href: "/classic-romance", label: "Classic romance" },
          { href: "/dystopian-classics", label: "Dystopian classics" },
          { href: "/search?topic=philosophy", label: "Philosophy" },
          { href: "/dark-mode-ebook-reader", label: "Dark-mode reader" },
        ]}
      />

      <LandingCta
        title="Begin a Russian classic tonight"
        body="Crime and Punishment, War and Peace, The Brothers Karamazov — pick the one that has intimidated you longest, and start tonight."
        href="/book/2600"
        label="Read War and Peace free"
      />
    </LandingShell>
  );
}

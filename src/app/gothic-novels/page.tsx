import type { Metadata } from "next";
import { Moon, Castle, BookMarked } from "lucide-react";
import { GOTHIC_NOVELS } from "@/lib/collections";
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

const TITLE = "Gothic novels, free to read online";
const DESCRIPTION =
  "Frankenstein, Dracula, Wuthering Heights and the rest of the gothic canon — read free in your browser on goread, with a midnight theme made for them.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/gothic-novels" },
  openGraph: { type: "website", title: `${TITLE} — goread`, description: DESCRIPTION, url: "/gothic-novels" },
};

const FAQ = [
  {
    q: "Are these gothic novels really free?",
    a: "Yes. Every title here is in the U.S. public domain through Project Gutenberg, so you can read the whole book free — no purchase, no trial, no account.",
  },
  {
    q: "Can I read them without downloading anything?",
    a: "That's the point. Tap a cover and the book opens straight in your browser. Nothing to sideload, no EPUB to manage, no app store.",
  },
  {
    q: "Is there a dark theme for reading at night?",
    a: "Five reading themes, including a true midnight mode and a soft e-ink mode — gothic novels were made to be read after dark.",
  },
];

export default function GothicNovelsPage() {
  return (
    <LandingShell>
      <LandingJsonLd path="/gothic-novels" name="Gothic novels" description={DESCRIPTION} collection books={GOTHIC_NOVELS} faq={FAQ} />

      <LandingHero
        eyebrow="Gothic fiction · free"
        title="Gothic novels to read free online"
        lede={
          <>
            Crumbling houses, a portrait that ages in your place, a thing stitched together and
            given life. The gothic novels collected here invented the modern thrill of dread — and
            almost all of them are <strong className="text-fg">free in the public domain</strong>.
            Open one in your browser and read by midnight light.
          </>
        }
        primary={{ href: "/search?topic=gothic", label: "Browse all gothic" }}
        secondary={{ href: "/gutenberg", label: "How goread works" }}
      />

      <LandingBooks
        title="The gothic canon"
        subtitle="The books that taught us to be afraid of the dark — and of ourselves."
        books={GOTHIC_NOVELS}
      />

      <LandingProse title="What makes a novel gothic">
        <p>
          It isn&rsquo;t just ghosts. The gothic is a mood: an old building with a secret, a hero
          undone by their own desire, a dread that comes from inside the house as much as outside
          it. Walpole started it in 1764 with <em>The Castle of Otranto</em>; Mary Shelley turned it
          into science; Stoker and Stevenson gave it teeth and a double life.
        </p>
        <p>
          Two centuries on, the chill still lands — and because these books have outlived their
          copyrights, you can read every page of them for nothing.
        </p>
      </LandingProse>

      <LandingFeatures
        title="Built for reading after dark"
        items={[
          { icon: Moon, title: "Midnight & e-ink themes", body: "Two low-light modes that keep the page calm and the dread on the page, not in your eyes." },
          { icon: Castle, title: "Editorial typography", body: "Drop caps and display headings give these old novels the typeset feel of a hardback." },
          { icon: BookMarked, title: "Never lose the dread", body: "Your place is kept across sessions and devices, so the tension picks up exactly where you left it." },
        ]}
      />

      <LandingFaqs items={FAQ} />

      <LandingRelated
        links={[
          { href: "/dystopian-classics", label: "Dystopian classics" },
          { href: "/victorian-novels", label: "Victorian novels" },
          { href: "/classic-romance", label: "Classic romance" },
          { href: "/search?topic=horror", label: "Horror" },
          { href: "/dark-mode-ebook-reader", label: "Dark-mode reader" },
        ]}
      />

      <LandingCta
        title="Start with a classic chill"
        body="Frankenstein, Dracula, Dorian Gray — pick one and start reading free, right now."
        href="/book/84"
        label="Read Frankenstein free"
      />
    </LandingShell>
  );
}

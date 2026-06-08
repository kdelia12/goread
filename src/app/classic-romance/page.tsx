import type { Metadata } from "next";
import { Heart, Sparkles, BookMarked } from "lucide-react";
import { CLASSIC_ROMANCE } from "@/lib/collections";
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

const TITLE = "Classic romance novels, free online";
const DESCRIPTION =
  "Pride and Prejudice, Jane Eyre, Persuasion and more — the classic love stories, free to read in your browser on goread. No download, no sign-up.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/classic-romance" },
  openGraph: { type: "website", title: `${TITLE} — goread`, description: DESCRIPTION, url: "/classic-romance" },
};

const FAQ = [
  {
    q: "Is Pride and Prejudice free to read here?",
    a: "Completely. Austen's novels are long out of copyright, so you can read every chapter free in your browser — no purchase and no account.",
  },
  {
    q: "Are these swoony or are they tragic?",
    a: "Both, by design. Austen gives you the witty, satisfying courtship; the Brontës and Hardy give you love that costs something. The grid below runs the full range.",
  },
  {
    q: "Can I save the lines I love?",
    a: "Yes — highlight a passage to bookmark it, or turn any line into a shareable Story image. Classic romance has the best lines to quote.",
  },
];

export default function ClassicRomancePage() {
  return (
    <LandingShell>
      <LandingJsonLd path="/classic-romance" name="Classic romance" description={DESCRIPTION} collection books={CLASSIC_ROMANCE} faq={FAQ} />

      <LandingHero
        eyebrow="Love stories · free"
        title="Classic romance novels, free to read online"
        lede={
          <>
            A proud man, a sharp woman, and three volumes before they admit it. From Austen&rsquo;s
            perfect courtships to the Brontës&rsquo; storm-lit longing, the classic love story is{" "}
            <strong className="text-fg">free to read in full</strong> — open one and fall in.
          </>
        }
        primary={{ href: "/book/1342", label: "Read Pride and Prejudice" }}
        secondary={{ href: "/gutenberg", label: "How goread works" }}
      />

      <LandingBooks
        title="The great love stories"
        subtitle="From the wittiest courtships to the most ruinous passions."
        books={CLASSIC_ROMANCE}
      />

      <LandingProse title="Why the old romances still win">
        <p>
          Nobody made longing last like the nineteenth century. Austen turns a misread glance into a
          hundred pages of suspense; Charlotte Brontë gives Jane Eyre a love that refuses to make her
          small; Hardy lets one decision shadow an entire life. The stakes are a letter, a look, a
          single honest sentence finally spoken.
        </p>
        <p>
          They&rsquo;ve been swooned over for two centuries, and they cost nothing to read.
        </p>
      </LandingProse>

      <LandingFeatures
        title="Made for the parts you’ll reread"
        items={[
          { icon: BookMarked, title: "Bookmark the moment", body: "Mark the proposal, the letter, the turn — and come back to it whenever you need it." },
          { icon: Sparkles, title: "Quote to a Story", body: "Turn Austen's best line into a gorgeous share image, straight from the page." },
          { icon: Heart, title: "Read it your way", body: "Five themes and adjustable type — curl up with sepia and a serif, or keep it crisp and plain." },
        ]}
      />

      <LandingFaqs items={FAQ} />

      <LandingRelated
        links={[
          { href: "/victorian-novels", label: "Victorian novels" },
          { href: "/gothic-novels", label: "Gothic novels" },
          { href: "/russian-literature", label: "Russian literature" },
          { href: "/search?topic=love%20stories", label: "More love stories" },
          { href: "/read-classics-on-iphone", label: "Read on iPhone" },
        ]}
      />

      <LandingCta
        title="Fall for a classic"
        body="Pride and Prejudice, Jane Eyre, Persuasion — open one and let it take its sweet, devastating time."
        href="/book/105"
        label="Read Persuasion free"
      />
    </LandingShell>
  );
}

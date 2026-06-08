import type { Metadata } from "next";
import { Eye, Cog, Compass } from "lucide-react";
import { DYSTOPIAN_CLASSICS } from "@/lib/collections";
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

const TITLE = "Dystopian classics, free to read online";
const DESCRIPTION =
  "The public-domain dystopias and imagined futures — The Iron Heel, The Time Machine, Herland and more — free to read in your browser on goread. No download required.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/dystopian-classics" },
  openGraph: { type: "website", title: `${TITLE} — goread`, description: DESCRIPTION, url: "/dystopian-classics" },
};

const FAQ = [
  {
    q: "Are 1984 and Brave New World here?",
    a: "Not yet — those are still under copyright in the United States, so no honest free reader can offer the full text. What you can read free are the books that imagined the dystopia first: the public-domain visions that Orwell and Huxley were answering.",
  },
  {
    q: "Which of these is the best place to start?",
    a: "Jack London's The Iron Heel is the blueprint for the modern dystopia, and Wells's The Time Machine shows you the far end of it in a single afternoon. Both are short, both are free.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Every book opens in your browser. If you want it offline, install goread to your home screen and the reader works on the train or a plane.",
  },
];

export default function DystopianClassicsPage() {
  return (
    <LandingShell>
      <LandingJsonLd path="/dystopian-classics" name="Dystopian classics" description={DESCRIPTION} collection books={DYSTOPIAN_CLASSICS} faq={FAQ} />

      <LandingHero
        eyebrow="Imagined futures · free"
        title="Dystopian classics, free to read online"
        lede={
          <>
            Before <em>1984</em>, writers were already mapping the futures we feared — boot-heeled
            oligarchies, machine cities, utopias with a catch. These are{" "}
            <strong className="text-fg">the dystopias you can actually read free</strong>, because
            they&rsquo;re old enough to belong to everyone.
          </>
        }
        primary={{ href: "/book/1164", label: "Read The Iron Heel" }}
        secondary={{ href: "/gutenberg", label: "How goread works" }}
      />

      <LandingBooks
        title="Dystopias & dark utopias"
        subtitle="The public-domain futures — from Wells’s machine age to London’s iron heel."
        books={DYSTOPIAN_CLASSICS}
      />

      <LandingProse title="The futures that came first">
        <p>
          The twentieth century&rsquo;s great dystopias didn&rsquo;t come from nowhere. Jack London
          imagined a corporate tyranny in <em>The Iron Heel</em> decades before Orwell; H. G. Wells
          split humanity in two in <em>The Time Machine</em> and built a sleeping-giant police state
          in <em>When the Sleeper Wakes</em>. Even the utopias here — Bellamy&rsquo;s, Gilman&rsquo;s
          — carry a warning in the lining.
        </p>
        <p>
          Read them and you can watch the genre being invented, one uneasy future at a time.
        </p>
      </LandingProse>

      <LandingFeatures
        title="Reading for the end of the world"
        items={[
          { icon: Eye, title: "Distraction-free reader", body: "No ads, no pop-ups, no feeds — just the text and a page that gets out of the way." },
          { icon: Cog, title: "Works offline", body: "Install to your home screen and these futures come with you, signal or no signal." },
          { icon: Compass, title: "Five reading themes", body: "Cold daylight or a bleak midnight — set the mood the book deserves." },
        ]}
      />

      <LandingFaqs items={FAQ} />

      <LandingRelated
        links={[
          { href: "/gothic-novels", label: "Gothic novels" },
          { href: "/russian-literature", label: "Russian literature" },
          { href: "/search?topic=science%20fiction", label: "Science fiction" },
          { href: "/search?topic=adventure", label: "Adventure" },
          { href: "/dark-mode-ebook-reader", label: "Dark-mode reader" },
        ]}
      />

      <LandingCta
        title="Step into a darker future"
        body="The Iron Heel, The Time Machine, Herland — see which imagined future got closest to ours."
        href="/book/35"
        label="Read The Time Machine free"
      />
    </LandingShell>
  );
}

import type { Metadata } from "next";
import { Lamp, BookMarked, Layers } from "lucide-react";
import { VICTORIAN_NOVELS } from "@/lib/collections";
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

const TITLE = "Victorian novels, free to read online";
const DESCRIPTION =
  "Dickens, the Brontës, Eliot, Hardy — the great Victorian novels, free to read in your browser on goread. Great Expectations to Middlemarch, no download needed.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/victorian-novels" },
  openGraph: { type: "website", title: `${TITLE} — goread`, description: DESCRIPTION, url: "/victorian-novels" },
};

const FAQ = [
  {
    q: "What counts as a Victorian novel?",
    a: "Roughly, the novels written during Queen Victoria's reign (1837–1901) — the golden age of the big English novel, from Dickens and the Brontës to George Eliot and Thomas Hardy.",
  },
  {
    q: "Are the full novels here, or abridged?",
    a: "Always the complete, unabridged text, exactly as published. These are full Project Gutenberg editions, free to read end to end.",
  },
  {
    q: "Can I read these on an e-reader or tablet?",
    a: "Yes — goread runs in any modern browser and installs to your home screen, so an iPad, a phone, or a laptop all work. Pick the e-ink theme for a paper-like page; on a Kobo or a Kindle's basic browser, results vary by model.",
  },
];

export default function VictorianNovelsPage() {
  return (
    <LandingShell>
      <LandingJsonLd path="/victorian-novels" name="Victorian novels" description={DESCRIPTION} collection books={VICTORIAN_NOVELS} faq={FAQ} />

      <LandingHero
        eyebrow="Victorian fiction · free"
        title="Victorian novels, free to read online"
        lede={
          <>
            The Victorians built the novel as we know it — big, social, unhurried, written to be
            lived in for weeks. Dickens, the Brontës, George Eliot, Hardy: the whole nineteenth-
            century shelf is on <strong className="text-fg">Project Gutenberg, free</strong> to read
            in your browser.
          </>
        }
        primary={{ href: "/book/1400", label: "Read Great Expectations" }}
        secondary={{ href: "/gutenberg", label: "How goread works" }}
      />

      <LandingBooks
        title="The essential Victorian shelf"
        subtitle="Dickens, the Brontës, Eliot, Hardy, Thackeray — and a little Sherlock to finish."
        books={VICTORIAN_NOVELS}
      />

      <LandingProse title="The golden age of the English novel">
        <p>
          This is the era that taught fiction to hold a whole world at once. Dickens crowded his
          pages with a city; George Eliot mapped a provincial town in <em>Middlemarch</em> so
          completely it still feels like the most grown-up book in English. Hardy let the landscape
          do the grieving. The Brontës smuggled passion past the parlour.
        </p>
        <p>
          They were written to be read slowly, by lamplight, in instalments — which is exactly how
          good they still are.
        </p>
      </LandingProse>

      <LandingFeatures
        title="A reading room for the long Victorian novel"
        items={[
          { icon: Lamp, title: "Five reading themes", body: "Daylight, paper, sepia, midnight and e-ink — set the page to the light you're actually in." },
          { icon: BookMarked, title: "Bookmarks & streaks", body: "Mark the passages that matter and build a daily habit while you work through a doorstopper." },
          { icon: Layers, title: "Continuous scroll", body: "Let a serialized three-decker flow as one unbroken column — no chapter-by-chapter tapping." },
        ]}
      />

      <LandingFaqs items={FAQ} />

      <LandingRelated
        links={[
          { href: "/gothic-novels", label: "Gothic novels" },
          { href: "/classic-romance", label: "Classic romance" },
          { href: "/russian-literature", label: "Russian literature" },
          { href: "/dystopian-classics", label: "Dystopian classics" },
          { href: "/search?topic=detective", label: "Mystery & detective" },
          { href: "/eink-reader-online", label: "E-ink reader" },
        ]}
      />

      <LandingCta
        title="Open a Victorian classic"
        body="Great Expectations, Jane Eyre, Middlemarch — settle in with one the way they were meant to be read: slowly."
        href="/book/1260"
        label="Read Jane Eyre free"
      />
    </LandingShell>
  );
}

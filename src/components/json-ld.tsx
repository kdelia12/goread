import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/site";
import { displayTitle } from "@/lib/format";
import type { Book } from "@/lib/types";

/** Inline a JSON-LD graph. Safe: JSON.stringify escapes `<`/`>` via replace. */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}

/** Site-wide: Organization + WebSite with a Sitelinks search box. */
export function SiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${SITE_URL}/#org`,
            name: SITE_NAME,
            url: SITE_URL,
            logo: `${SITE_URL}/icon-512.png`,
            description: SITE_DESCRIPTION,
          },
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
            publisher: { "@id": `${SITE_URL}/#org` },
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@type": "WebApplication",
            "@id": `${SITE_URL}/#app`,
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
            applicationCategory: "BookApplication",
            operatingSystem: "Any modern browser (iOS, Android, desktop, tablets)",
            browserRequirements: "Requires a modern browser; installable as a PWA",
            isAccessibleForFree: true,
            publisher: { "@id": `${SITE_URL}/#org` },
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            featureList: [
              "70,000+ free public-domain classics from Project Gutenberg",
              "Read instantly with no sign-up",
              "Five reading themes including e-ink",
              "Editorial typography",
              "Bookmarks and reading streaks",
              "Turn any quote into an Instagram Story",
              "Installable to the home screen, works offline",
            ],
          },
        ],
      }}
    />
  );
}

export interface BookJsonLdInput {
  id: number;
  title: string;
  author: string;
  description?: string | null;
  image?: string | null;
  subjects?: string[];
  language?: string;
}

export interface LandingJsonLdInput {
  /** Route path, e.g. "/gothic-novels". */
  path: string;
  /** Page name — used for the schema name and the breadcrumb leaf. */
  name: string;
  description: string;
  /** Mark as a CollectionPage (genre/list pages) rather than a plain WebPage. */
  collection?: boolean;
  /** Books featured on the page → an ItemList of Book entry-points. */
  books?: Book[];
  /** On-page FAQ → a FAQPage node eligible for rich results. */
  faq?: { q: string; a: string }[];
}

/**
 * One JSON-LD graph for an SEO landing page: a (Collection)WebPage tied to the
 * site WebSite, a Home → page BreadcrumbList, and optional ItemList / FAQPage
 * nodes. Keeps every landing page's structured data consistent.
 */
export function LandingJsonLd({ path, name, description, collection, books, faq }: LandingJsonLdInput) {
  const url = `${SITE_URL}${path}`;
  const graph: Record<string, unknown>[] = [
    {
      "@type": collection ? "CollectionPage" : "WebPage",
      "@id": `${url}#page`,
      name,
      url,
      description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      ...(books && books.length ? { mainEntity: { "@id": `${url}#books` } } : {}),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "goread", item: SITE_URL },
        { "@type": "ListItem", position: 2, name, item: url },
      ],
    },
  ];

  if (books && books.length) {
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#books`,
      numberOfItems: books.length,
      itemListElement: books.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/book/${b.id}`,
        name: displayTitle(b.title),
      })),
    });
  }

  if (faq && faq.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return <JsonLd data={{ "@context": "https://schema.org", "@graph": graph }} />;
}

/** Per-book: Book + Breadcrumb, linked back to the site graph. */
export function BookJsonLd(book: BookJsonLdInput) {
  const url = `${SITE_URL}/book/${book.id}`;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Book",
            "@id": `${url}#book`,
            name: book.title,
            url,
            author: { "@type": "Person", name: book.author },
            ...(book.description ? { description: book.description } : {}),
            ...(book.image ? { image: book.image } : {}),
            ...(book.language ? { inLanguage: book.language } : {}),
            ...(book.subjects && book.subjects.length
              ? { about: book.subjects.slice(0, 8) }
              : {}),
            isAccessibleForFree: true,
            bookFormat: "https://schema.org/EBook",
            publisher: { "@id": `${SITE_URL}/#org` },
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${url}#breadcrumb`,
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "goread", item: SITE_URL },
              {
                "@type": "ListItem",
                position: 2,
                name: "Library",
                item: `${SITE_URL}/search`,
              },
              { "@type": "ListItem", position: 3, name: book.title, item: url },
            ],
          },
        ],
      }}
    />
  );
}

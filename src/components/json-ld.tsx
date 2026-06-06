import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/site";

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

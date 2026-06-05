import Link from "next/link";

export const metadata = {
  title: "About",
  description: "What goread is and where the books come from.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold text-fg">About goread</h1>
      <div className="mt-6 space-y-4 font-reading text-lg leading-relaxed text-fg/90">
        <p className="drop-cap">
          goread is a calm, beautiful home for the world’s classic literature — more than seventy
          thousand books that have entered the public domain, free to read on any device. No ads,
          no clutter, just the words and a comfortable place to read them.
        </p>
        <p>
          Every book comes from{" "}
          <a
            href="https://www.gutenberg.org"
            target="_blank"
            rel="noreferrer noopener"
            className="text-reader-link underline"
          >
            Project Gutenberg
          </a>
          , a volunteer effort to digitise and archive cultural works since 1971. These texts are
          free in the United States public domain; readers elsewhere should check their local
          copyright law.
        </p>
        <p>
          Choose a reading theme that suits the light, set your type just so, keep your place across
          devices, save the passages that move you, and share them. Build a reading streak. Take the
          classics with you.
        </p>
      </div>
      <p className="mt-8 text-sm text-muted-fg">
        goread is an independent reader and is not affiliated with or endorsed by Project Gutenberg.
        “Project Gutenberg” is a trademark of the Project Gutenberg Literary Archive Foundation.
      </p>
      <Link href="/search" className="mt-8 inline-block text-accent underline">
        Start browsing →
      </Link>
    </article>
  );
}

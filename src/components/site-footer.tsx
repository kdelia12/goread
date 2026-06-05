import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-10 text-sm text-muted-fg sm:flex-row sm:px-6">
        <p className="max-w-md">
          goread · books from{" "}
          <a
            href="https://www.gutenberg.org"
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-border-strong underline-offset-2 hover:text-accent"
          >
            Project Gutenberg
          </a>
          , free in the U.S. public domain.
        </p>
        <nav className="flex gap-5">
          <Link href="/about" className="hover:text-accent">
            About
          </Link>
          <Link href="/privacy" className="hover:text-accent">
            Privacy
          </Link>
          <Link href="/library" className="hover:text-accent">
            Library
          </Link>
        </nav>
      </div>
    </footer>
  );
}

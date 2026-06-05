import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="font-display text-7xl font-semibold text-accent">404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-fg">Page not found</h1>
      <p className="mt-2 text-muted-fg">
        We couldn’t find that page. The shelves are still full, though.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-[var(--radius)] bg-accent px-6 text-sm font-medium text-accent-fg"
      >
        Back home
      </Link>
    </div>
  );
}

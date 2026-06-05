import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <WifiOff className="h-10 w-10 text-muted-fg" />
      <h1 className="mt-4 font-display text-3xl font-semibold text-fg">You’re offline</h1>
      <p className="mt-3 text-muted-fg">
        Books you’ve already opened stay available for offline reading. Reconnect to browse the
        full catalogue.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-[var(--radius)] bg-accent px-6 text-sm font-medium text-accent-fg"
      >
        Try again
      </Link>
    </div>
  );
}

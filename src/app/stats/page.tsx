import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserId, isAuthEnabled } from "@/lib/auth";
import { ReadingStatsDashboard } from "@/components/reading-stats";

export const metadata = { title: "Your reading" };

export default async function StatsPage() {
  if (!isAuthEnabled()) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-fg">Members only</h1>
        <p className="mt-2 text-muted-fg">
          Accounts aren’t enabled in this build. Add Clerk keys to unlock your reading dashboard.
        </p>
        <Link href="/" className="mt-6 inline-block text-accent underline">
          Back home
        </Link>
      </div>
    );
  }

  // Middleware already gates this route; this is belt-and-suspenders.
  const userId = await getUserId();
  if (!userId) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Members</p>
      <h1 className="mt-1 font-display text-4xl font-semibold text-fg">Your reading</h1>
      <p className="mt-2 max-w-xl text-muted-fg">
        A private dashboard of your reading life — only signed-in members can see this, and it syncs
        with your account.
      </p>
      <div className="mt-8">
        <ReadingStatsDashboard />
      </div>
    </div>
  );
}

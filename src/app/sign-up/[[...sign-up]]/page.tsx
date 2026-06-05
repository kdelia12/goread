import Link from "next/link";
import { isAuthEnabled } from "@/lib/auth";
import { AuthScreen } from "@/components/auth-screen";

export const metadata = { title: "Sign up" };

export default function SignUpPage() {
  if (!isAuthEnabled()) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-fg">Accounts aren’t enabled</h1>
        <p className="mt-2 text-muted-fg">
          goread is running in guest mode — start reading right away, no account needed.
        </p>
        <Link href="/" className="mt-6 inline-block text-accent underline">
          Back home
        </Link>
      </div>
    );
  }
  return (
    <div className="flex justify-center px-4 py-16">
      <AuthScreen kind="signUp" />
    </div>
  );
}

import Link from "next/link";
import { isAuthEnabled } from "@/lib/auth";
import { AuthScreen } from "@/components/auth-screen";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  if (!isAuthEnabled()) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-fg">Accounts aren’t enabled</h1>
        <p className="mt-2 text-muted-fg">
          goread is running in guest mode — everything works and is saved on this device. Add Clerk
          keys to enable Google / Apple sign-in and cross-device sync.
        </p>
        <Link href="/" className="mt-6 inline-block text-accent underline">
          Back home
        </Link>
      </div>
    );
  }
  return (
    <div className="flex justify-center px-4 py-16">
      <AuthScreen kind="signIn" />
    </div>
  );
}

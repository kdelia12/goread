"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

/** Only mounted when Clerk is configured (see SiteHeader). */
export function AuthButtons() {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return null;

  return isSignedIn ? (
    <UserButton />
  ) : (
    <SignInButton mode="modal">
      <Button size="sm" variant="ghost">
        Sign in
      </Button>
    </SignInButton>
  );
}

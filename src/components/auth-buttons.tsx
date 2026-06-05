"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Only mounted when Clerk is configured (see SiteHeader). */
export function AuthButtons() {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) {
    return <div className="h-9 w-9" aria-hidden />;
  }

  return isSignedIn ? (
    <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
  ) : (
    <SignInButton mode="modal">
      <Button size="sm" variant="outline">
        <LogIn className="h-4 w-4" />
        Sign in
      </Button>
    </SignInButton>
  );
}

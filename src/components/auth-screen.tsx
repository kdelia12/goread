"use client";

import { SignIn, SignUp } from "@clerk/nextjs";

export function AuthScreen({ kind }: { kind: "signIn" | "signUp" }) {
  return kind === "signIn" ? <SignIn /> : <SignUp />;
}

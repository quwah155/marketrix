"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  OAuthSignin: {
    title: "OAuth Sign-In Error",
    description:
      "There was a problem connecting to the authentication provider. Please try again.",
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    description:
      "Authentication failed during the callback. This can happen if the request timed out.",
  },
  OAuthCreateAccount: {
    title: "Account Creation Failed",
    description:
      "We couldn't create your account with that provider. Try signing in with email instead.",
  },
  EmailCreateAccount: {
    title: "Email Account Error",
    description:
      "We couldn't create an account with that email address. It may already be in use.",
  },
  Callback: {
    title: "Callback Error",
    description:
      "An error occurred during authentication. Please try signing in again.",
  },
  OAuthAccountNotLinked: {
    title: "Account Already Exists",
    description:
      "An account with that email already exists. Please sign in with the method you originally used.",
  },
  EmailSignin: {
    title: "Email Sign-In Error",
    description:
      "We couldn't send the sign-in email. Please check your address and try again.",
  },
  CredentialsSignin: {
    title: "Invalid Credentials",
    description:
      "The email or password you entered is incorrect. Please try again.",
  },
  SessionRequired: {
    title: "Session Required",
    description: "You must be signed in to access this page.",
  },
  Default: {
    title: "Authentication Error",
    description:
      "An unexpected error occurred during sign-in. Please try again.",
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Default";
  const info =
    ERROR_MESSAGES[error] ?? ERROR_MESSAGES["Default"];

  return (
    <div className="text-center animate-fade-in">
      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto mb-6">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>

      <h1 className="text-2xl font-bold mb-2">{info.title}</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">{info.description}</p>

      {/* Error code badge */}
      {error !== "Default" && (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground mb-8">
          Error code: <code className="font-mono font-medium">{error}</code>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Link href="/auth/login">
          <Button className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="w-full text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Help text */}
      <p className="mt-8 text-xs text-muted-foreground">
        If this keeps happening,{" "}
        <Link
          href="/auth/register"
          className="text-brand-500 hover:underline"
        >
          create a new account
        </Link>{" "}
        or try a different sign-in method.
      </p>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted animate-pulse mx-auto mb-6" />
          <div className="h-6 w-48 rounded bg-muted animate-pulse mx-auto mb-2" />
          <div className="h-4 w-72 rounded bg-muted animate-pulse mx-auto" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}

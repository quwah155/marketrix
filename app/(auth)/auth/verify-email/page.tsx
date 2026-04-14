import { verifyEmail } from "@/server/actions/auth.actions";
import { redirect } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props { searchParams: { token?: string } }

export default async function VerifyEmailPage({ searchParams }: Props) {
  if (!searchParams.token) redirect("/auth/login");

  const result = await verifyEmail(searchParams.token);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <div className="max-w-md">
        {result.success ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 mx-auto mb-5">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
            <p className="text-muted-foreground mb-6">Your account has been verified. You can now sign in.</p>
            <Link href="/auth/login"><Button>Sign in to your account</Button></Link>
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 mx-auto mb-5">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-muted-foreground mb-6">{result.error ?? "This link is invalid or has expired."}</p>
            <Link href="/auth/register"><Button variant="secondary">Create a new account</Button></Link>
          </>
        )}
      </div>
    </div>
  );
}

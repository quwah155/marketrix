"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import { ArrowLeft, Mail } from "lucide-react";
import { forgotPasswordSchema } from "@/lib/validations";
import { requestPasswordReset } from "@/server/actions/auth.actions";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordForm) {
    setLoading(true);
    setServerMessage(null);

    try {
      const result = await requestPasswordReset(data.email);

      if (!result.success) {
        if (result.fieldErrors?.email?.[0]) {
          setError("email", {
            type: "server",
            message: result.fieldErrors.email[0],
          });
        }

        const message =
          result.error ?? "We couldn't start the password reset flow.";
        setServerMessage(message);
        toast.error(message);
        return;
      }

      setSubmitted(true);
      setServerMessage(result.message ?? "If that email exists, you'll receive a reset link.");
      toast.success(result.message ?? "Password reset email sent.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-6">
          <BrandLogo />
        </div>
        <h1 className="text-2xl font-bold">Forgot your password?</h1>
        <p className="mt-1 text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950 text-emerald-400">
            <Mail className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Check your email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {serverMessage}
            </p>
          </div>
          <Link href="/auth/login">
            <Button variant="secondary" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverMessage ? (
              <div className="rounded-xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                {serverMessage}
              </div>
            ) : null}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-chartreuse hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

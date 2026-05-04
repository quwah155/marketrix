"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import { Mail, Lock, User } from "lucide-react";
import { registerSchema } from "@/lib/validations";
import { registerUser } from "@/server/actions/auth.actions";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RegisterForm = z.infer<typeof registerSchema>;

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") === "VENDOR" ? "VENDOR" : "BUYER";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role },
  });

  async function onSubmit(data: RegisterForm) {
    setLoading(true);
    setServerError(null);
    try {
      const formData = new FormData();
      Object.entries({ ...data, role }).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      const result = await registerUser(formData);

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            const message = messages?.[0];
            if (!message) continue;
            setError(field as keyof RegisterForm, { type: "server", message });
          }
        }

        const message =
          result.error ??
          "We couldn't create your account right now. Please try again.";
        setSuccess(false);
        setServerError(message);
        toast.error(message);
        return;
      }

      setSuccess(true);
      toast.success(result.message ?? "Account created!");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="animate-fade-in text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
          <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold">Check your email</h2>
        <p className="mb-6 text-muted-foreground">
          We&apos;ve sent a verification link to your email address. Please verify to continue.
        </p>
        <Button onClick={() => router.push("/auth/login")} variant="secondary">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <BrandLogo className="mb-6" />
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-muted-foreground">Start buying or selling today</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link
          href="/auth/register?role=BUYER"
          className={`flex items-center justify-center rounded-xl border-2 p-3 text-sm font-medium transition-all ${
            role === "BUYER"
              ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400"
              : "border-border hover:border-brand-300"
          }`}
        >
          Buyer account
        </Link>
        <Link
          href="/auth/register?role=VENDOR"
          className={`flex items-center justify-center rounded-xl border-2 p-3 text-sm font-medium transition-all ${
            role === "VENDOR"
              ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400"
              : "border-border hover:border-brand-300"
          }`}
        >
          Vendor account
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {serverError}
          </div>
        ) : null}

        <Input
          label="Full name"
          placeholder="John Doe"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          leftIcon={<Lock className="h-4 w-4" />}
          hint="Must contain an uppercase letter and a number."
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" className="mt-2 w-full" isLoading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-brand-500 hover:underline">
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="mx-auto h-8 w-48 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}

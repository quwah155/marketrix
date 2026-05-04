"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import { passwordSettingsSchema } from "@/lib/validations";
import { savePasswordSettings } from "@/server/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Lock } from "lucide-react";

type PasswordSettingsFormValues = z.infer<typeof passwordSettingsSchema>;

export function PasswordSettingsForm() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<PasswordSettingsFormValues>({
    resolver: zodResolver(passwordSettingsSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: PasswordSettingsFormValues) {
    setLoading(true);
    setServerError(null);
    try {
      const formData = new FormData();
      formData.append("currentPassword", data.currentPassword);
      formData.append("newPassword", data.newPassword);
      formData.append("confirmPassword", data.confirmPassword);

      const result = await savePasswordSettings(formData);
      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            const message = messages?.[0];
            if (!message) continue;
            setError(field as keyof PasswordSettingsFormValues, {
              type: "server",
              message,
            });
          }
        }

        const message = result.error ?? "Unable to update password.";
        setServerError(message);
        toast.error(message);
        return;
      }

      reset();
      toast.success(result.message ?? "Password updated.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <p className="text-sm text-muted-foreground">
          Keep your account secure with a strong password.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              {serverError}
            </div>
          ) : null}

          <Input
            label="Current password"
            type="password"
            leftIcon={<KeyRound className="h-4 w-4" />}
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />

          <Input
            label="New password"
            type="password"
            leftIcon={<Lock className="h-4 w-4" />}
            hint="Use at least 8 characters with one uppercase letter and one number."
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />

          <Input
            label="Confirm new password"
            type="password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <div className="flex justify-end">
            <Button type="submit" isLoading={loading} disabled={!isDirty && !loading}>
              Update password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

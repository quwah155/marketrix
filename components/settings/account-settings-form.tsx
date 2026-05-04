"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import { accountSettingsSchema } from "@/lib/validations";
import { saveAccountSettings } from "@/server/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Mail, ShieldCheck, User } from "lucide-react";

type AccountSettingsFormValues = z.infer<typeof accountSettingsSchema>;

export function AccountSettingsForm({
  roleLabel,
  email,
  emailVerified,
  initialValues,
}: {
  roleLabel: string;
  email: string;
  emailVerified: boolean;
  initialValues: {
    name: string;
    bio?: string | null;
    image?: string | null;
  };
}) {
  const router = useRouter();
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<AccountSettingsFormValues>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      name: initialValues.name ?? "",
      bio: initialValues.bio ?? "",
      image: initialValues.image ?? "",
    },
  });

  async function onSubmit(data: AccountSettingsFormValues) {
    setLoading(true);
    setServerError(null);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("bio", data.bio ?? "");
      formData.append("image", data.image ?? "");

      const result = await saveAccountSettings(formData);
      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            const message = messages?.[0];
            if (!message) continue;
            setError(field as keyof AccountSettingsFormValues, {
              type: "server",
              message,
            });
          }
        }

        const message = result.error ?? "Unable to save account settings.";
        setServerError(message);
        toast.error(message);
        return;
      }

      await update?.({
        name: result.data.name,
        image: result.data.image,
      });
      router.refresh();
      toast.success(result.message ?? "Account settings updated.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Account profile</CardTitle>
            <p className="text-sm text-muted-foreground">
              Update the details that appear throughout your workspace.
            </p>
          </div>
          <Badge variant={emailVerified ? "success" : "warning"}>
            {emailVerified ? "Email verified" : "Verification pending"}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-muted/30 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{roleLabel}</p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              {serverError}
            </div>
          ) : null}

          <Input
            label="Display name"
            placeholder="Your name"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="Email address"
            value={email}
            disabled
            leftIcon={<Mail className="h-4 w-4" />}
            hint="Email changes are intentionally locked until verification flows are expanded."
          />

          <Input
            label="Avatar URL"
            placeholder="https://example.com/avatar.jpg"
            leftIcon={<Camera className="h-4 w-4" />}
            error={errors.image?.message}
            {...register("image")}
          />

          <Textarea
            label="Bio"
            placeholder="Tell people a little about yourself."
            error={errors.bio?.message}
            hint="This supports buyer, vendor, and admin profiles in the app."
            {...register("bio")}
          />

          <div className="flex items-center justify-end gap-3">
            <Button type="submit" isLoading={loading} disabled={!isDirty && !loading}>
              Save profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

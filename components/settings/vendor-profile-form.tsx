"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import { vendorProfileSchema } from "@/lib/validations";
import { saveVendorProfileSettings } from "@/server/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, ImageIcon, Info } from "lucide-react";

type VendorProfileFormValues = z.infer<typeof vendorProfileSchema>;

export function VendorProfileForm({
  initialValues,
  verified,
}: {
  initialValues: {
    bio?: string | null;
    website?: string | null;
    avatar?: string | null;
  };
  verified: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<VendorProfileFormValues>({
    resolver: zodResolver(vendorProfileSchema),
    defaultValues: {
      bio: initialValues.bio ?? "",
      website: initialValues.website ?? "",
      avatar: initialValues.avatar ?? "",
    },
  });

  async function onSubmit(data: VendorProfileFormValues) {
    setLoading(true);
    setServerError(null);
    try {
      const formData = new FormData();
      formData.append("bio", data.bio ?? "");
      formData.append("website", data.website ?? "");
      formData.append("avatar", data.avatar ?? "");

      const result = await saveVendorProfileSettings(formData);
      if (!result.success) {
        if (result.fieldErrors) {
          for (const [field, messages] of Object.entries(result.fieldErrors)) {
            const message = messages?.[0];
            if (!message) continue;
            setError(field as keyof VendorProfileFormValues, {
              type: "server",
              message,
            });
          }
        }

        const message = result.error ?? "Unable to update vendor profile.";
        setServerError(message);
        toast.error(message);
        return;
      }

      toast.success(result.message ?? "Vendor profile updated.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Storefront profile</CardTitle>
            <p className="text-sm text-muted-foreground">
              Shape how buyers see your public vendor presence.
            </p>
          </div>
          <Badge variant={verified ? "success" : "warning"}>
            {verified ? "Verified vendor" : "Verification pending"}
          </Badge>
        </div>

        <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          Buyers will see your public bio and website on product and marketplace surfaces as the storefront expands.
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
              {serverError}
            </div>
          ) : null}

          <Textarea
            label="Vendor bio"
            placeholder="What do you build, who is it for, and why should buyers trust your work?"
            error={errors.bio?.message}
            hint="A concise, credible bio converts better than a long sales pitch."
            {...register("bio")}
          />

          <Input
            label="Website"
            placeholder="https://yourstudio.com"
            leftIcon={<Globe className="h-4 w-4" />}
            error={errors.website?.message}
            {...register("website")}
          />

          <Input
            label="Storefront image URL"
            placeholder="https://yourstudio.com/avatar.jpg"
            leftIcon={<ImageIcon className="h-4 w-4" />}
            error={errors.avatar?.message}
            hint="Use a square image for the cleanest presentation."
            {...register("avatar")}
          />

          <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-brand-500" />
              Keep your storefront details current so buyers can trust the brand behind each product.
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" isLoading={loading} disabled={!isDirty && !loading}>
              Save storefront
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

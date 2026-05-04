"use server";

import { revalidatePath } from "next/cache";
import {
  accountSettingsSchema,
  passwordSettingsSchema,
  vendorProfileSchema,
} from "@/lib/validations";
import { requireAuth, requireVendor } from "@/server/guards/auth.guard";
import {
  updateAccountSettings,
  updatePasswordSettings,
  updateVendorProfileSettings,
} from "@/services/settings.service";
import type { ApiResponse } from "@/types";

export async function saveAccountSettings(
  formData: FormData
): Promise<
  ApiResponse<{
    name: string;
    bio: string;
    image: string | null;
  }>
> {
  const user = await requireAuth();

  const raw = {
    name: formData.get("name"),
    bio: formData.get("bio") ?? "",
    image: formData.get("image") ?? "",
  };

  const result = accountSettingsSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const response = await updateAccountSettings({
    userId: user.id,
    ...result.data,
  });

  if (!response.success) return response;

  if (user.role === "ADMIN") {
    revalidatePath("/admin");
    revalidatePath("/admin/settings");
  } else if (user.role === "VENDOR") {
    revalidatePath("/dashboard/vendor");
    revalidatePath("/dashboard/vendor/settings");
  } else {
    revalidatePath("/dashboard/buyer");
    revalidatePath("/dashboard/buyer/settings");
  }

  return response;
}

export async function saveVendorProfileSettings(
  formData: FormData
): Promise<
  ApiResponse<{
    bio: string;
    website: string;
    avatar: string;
  }>
> {
  const user = await requireVendor();

  const raw = {
    bio: formData.get("bio") ?? "",
    website: formData.get("website") ?? "",
    avatar: formData.get("avatar") ?? "",
  };

  const result = vendorProfileSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const response = await updateVendorProfileSettings({
    userId: user.id,
    ...result.data,
  });

  if (!response.success) return response;

  revalidatePath("/dashboard/vendor");
  revalidatePath("/dashboard/vendor/settings");
  revalidatePath("/products");

  return response;
}

export async function savePasswordSettings(
  formData: FormData
): Promise<ApiResponse<null>> {
  const user = await requireAuth();

  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const result = passwordSettingsSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  return updatePasswordSettings({
    userId: user.id,
    currentPassword: result.data.currentPassword,
    newPassword: result.data.newPassword,
  });
}

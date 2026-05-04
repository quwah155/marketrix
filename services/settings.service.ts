import bcrypt from "bcryptjs";
import type { ApiResponse } from "@/types";
import { userRepository } from "@/server/repositories/user.repository";
import { vendorProfileRepository } from "@/server/repositories/vendor-profile.repository";

const SALT_ROUNDS = 12;

export async function updateAccountSettings(input: {
  userId: string;
  name: string;
  bio?: string;
  image?: string;
}): Promise<
  ApiResponse<{
    name: string;
    bio: string;
    image: string | null;
  }>
> {
  const updated = await userRepository.updateProfile(input.userId, {
    name: input.name.trim(),
    bio: input.bio?.trim() ?? "",
    image: input.image?.trim() ? input.image.trim() : null,
  });

  return {
    success: true,
    data: {
      name: updated?.name ?? input.name.trim(),
      bio: updated?.bio ?? input.bio?.trim() ?? "",
      image: updated?.image ?? null,
    },
    message: "Account settings updated.",
  };
}

export async function updateVendorProfileSettings(input: {
  userId: string;
  bio?: string;
  website?: string;
  avatar?: string;
}): Promise<
  ApiResponse<{
    bio: string;
    website: string;
    avatar: string;
  }>
> {
  await vendorProfileRepository.upsertForUser(input.userId);
  const updated = await vendorProfileRepository.updateProfile(input.userId, {
    bio: input.bio?.trim() ?? "",
    website: input.website?.trim() ?? "",
    avatar: input.avatar?.trim() ?? "",
  });

  return {
    success: true,
    data: {
      bio: updated?.bio ?? input.bio?.trim() ?? "",
      website: updated?.website ?? input.website?.trim() ?? "",
      avatar: updated?.avatar ?? input.avatar?.trim() ?? "",
    },
    message: "Vendor profile updated.",
  };
}

export async function updatePasswordSettings(input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<ApiResponse<null>> {
  const user = await userRepository.findById(input.userId);
  if (!user?.passwordHash) {
    return {
      success: false,
      error: "This account does not support password changes here.",
    };
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    input.currentPassword,
    user.passwordHash
  );

  if (!isCurrentPasswordValid) {
    return {
      success: false,
      error: "Current password is incorrect.",
      fieldErrors: { currentPassword: ["Current password is incorrect."] },
    };
  }

  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await userRepository.updatePassword(input.userId, passwordHash);

  return {
    success: true,
    data: null,
    message: "Password updated successfully.",
  };
}

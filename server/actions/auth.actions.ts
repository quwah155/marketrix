"use server";

import { registerSchema, resetPasswordSchema } from "@/lib/validations";
import {
  registerAccount,
  resetPasswordWithToken,
  sendPasswordReset,
  verifyEmailToken,
} from "@/services/auth.service";
import type { ApiResponse } from "@/types";

export async function registerUser(
  formData: FormData
): Promise<ApiResponse<{ email: string }>> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? "BUYER",
  };

  const result = registerSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password, role } = result.data;
  return registerAccount({ name, email, password, role });
}

export async function verifyEmail(
  token: string
): Promise<ApiResponse<{ email: string }>> {
  return verifyEmailToken(token);
}

export async function requestPasswordReset(
  email: string
): Promise<ApiResponse<null>> {
  return sendPasswordReset(email);
}

export async function resetPassword(
  formData: FormData
): Promise<ApiResponse<null>> {
  const raw = {
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const result = resetPasswordSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { token, password } = result.data;
  return resetPasswordWithToken({ token, password });
}

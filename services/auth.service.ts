import bcrypt from "bcryptjs";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import { generateToken } from "@/lib/utils";
import type { ApiResponse } from "@/types";
import { userRepository } from "@/server/repositories/user.repository";
import { vendorProfileRepository } from "@/server/repositories/vendor-profile.repository";
import { verificationTokenRepository } from "@/server/repositories/verification-token.repository";
import { Role } from "@/types/db";

const SALT_ROUNDS = 12;
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
const RESET_TOKEN_EXPIRY_HOURS = 1;

export async function registerAccount(input: {
  name: string;
  email: string;
  password: string;
  role: "BUYER" | "VENDOR";
}): Promise<ApiResponse<{ email: string }>> {
  const existing = await userRepository.findByEmail(input.email);
  if (existing) {
    return { success: false, error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await userRepository.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role as Role,
  });

  if (input.role === "VENDOR") {
    await vendorProfileRepository.createForUser(user.id);
  }

  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
  );
  await verificationTokenRepository.create({
    userId: user.id,
    token,
    expiresAt,
  });

  try {
    await sendVerificationEmail(input.email, token);
  } catch {
    console.error("[Email] Failed to send verification email to:", input.email);
  }

  return {
    success: true,
    data: { email: input.email },
    message: "Account created! Please check your email to verify your account.",
  };
}

export async function verifyEmailToken(
  token: string
): Promise<ApiResponse<{ email: string }>> {
  const record = await verificationTokenRepository.findByToken(token);
  if (!record) {
    return { success: false, error: "Invalid or expired verification link" };
  }

  if (record.expiresAt < new Date()) {
    await verificationTokenRepository.deleteById(record.id);
    return {
      success: false,
      error: "Verification link has expired. Please request a new one.",
    };
  }

  await userRepository.markEmailVerified(record.userId);
  await verificationTokenRepository.deleteById(record.id);

  const user = await userRepository.findById(record.userId);
  return {
    success: true,
    data: { email: user?.email ?? "" },
    message: "Email verified successfully! You can now sign in.",
  };
}

export async function sendPasswordReset(
  email: string
): Promise<ApiResponse<null>> {
  const normalized = email.toLowerCase();
  const user = await userRepository.findByEmail(normalized);

  if (!user) {
    return {
      success: true,
      data: null,
      message: "If that email exists, you'll receive a reset link.",
    };
  }

  await verificationTokenRepository.deletePasswordResetByUser(user.id);

  const token = generateToken();
  await verificationTokenRepository.create({
    userId: user.id,
    token,
    type: "PASSWORD_RESET",
    expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
  });

  try {
    await sendPasswordResetEmail(normalized, token);
  } catch {
    console.error("[Email] Failed to send reset email to:", normalized);
  }

  return {
    success: true,
    data: null,
    message: "If that email exists, you'll receive a reset link.",
  };
}

export async function resetPasswordWithToken(input: {
  token: string;
  password: string;
}): Promise<ApiResponse<null>> {
  const record = await verificationTokenRepository.findByToken(input.token);
  if (!record || record.type !== "PASSWORD_RESET") {
    return { success: false, error: "Invalid or expired reset link" };
  }

  if (record.expiresAt < new Date()) {
    await verificationTokenRepository.deleteById(record.id);
    return {
      success: false,
      error: "Reset link has expired. Please request a new one.",
    };
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  await userRepository.updatePassword(record.userId, passwordHash);
  await verificationTokenRepository.deleteById(record.id);

  return {
    success: true,
    data: null,
    message: "Password reset successfully. You can now sign in.",
  };
}

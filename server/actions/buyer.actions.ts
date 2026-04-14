"use server";

import { requireBuyer, getCurrentUser } from "@/server/guards/auth.guard";
import { reviewSchema, messageSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";
import { revalidatePath } from "next/cache";
import {
  getOrCreateThreadByBuyerVendor,
  sendThreadMessage,
} from "@/services/messaging.service";
import { submitProductReview } from "@/services/review.service";

// ================================
// REVIEWS
// ================================
export async function submitReview(
  formData: FormData
): Promise<ApiResponse<{ id: string }>> {
  const user = await requireBuyer();

  const raw = {
    rating: formData.get("rating"),
    comment: formData.get("comment"),
    productId: formData.get("productId"),
  };

  const result = reviewSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const response = await submitProductReview({
    buyerId: user.id,
    productId: result.data.productId,
    rating: result.data.rating,
    comment: result.data.comment,
  });
  if (!response.success) return response;

  revalidatePath(`/products`);

  return response;
}

export async function submitReviewAction(formData: FormData): Promise<void> {
  await submitReview(formData);
}

// ================================
// MESSAGING
// ================================
export async function getOrCreateThread(
  vendorUserId: string
): Promise<ApiResponse<{ threadId: string }>> {
  const user = await requireBuyer();

  // Buyers can't message themselves
  if (user.id === vendorUserId) {
    return { success: false, error: "Cannot message yourself" };
  }

  return getOrCreateThreadByBuyerVendor({ buyerId: user.id, vendorUserId });
}

export async function sendMessage(
  formData: FormData
): Promise<ApiResponse<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const raw = {
    content: formData.get("content"),
    threadId: formData.get("threadId"),
  };

  const result = messageSchema.safeParse(raw);
  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const response = await sendThreadMessage({
    threadId: result.data.threadId,
    senderId: user.id,
    content: result.data.content,
  });
  if (!response.success) return { success: false, error: response.error };
  return { success: true, data: { id: response.data.id } };
}

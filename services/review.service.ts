import type { ApiResponse } from "@/types";
import { orderRepository } from "@/server/repositories/order.repository";
import { reviewRepository } from "@/server/repositories/review.repository";

export async function submitProductReview(input: {
  buyerId: string;
  productId: string;
  rating: number;
  comment?: string;
}): Promise<ApiResponse<{ id: string }>> {
  const hasPurchased = await orderRepository.findCompletedPurchase(
    input.buyerId,
    input.productId
  );

  if (!hasPurchased) {
    return {
      success: false,
      error: "You can only review products you have purchased",
    };
  }

  const review = await reviewRepository.upsertByBuyerAndProduct({
    buyerId: input.buyerId,
    productId: input.productId,
    rating: input.rating,
    comment: input.comment,
  });

  return { success: true, data: { id: review.id } };
}

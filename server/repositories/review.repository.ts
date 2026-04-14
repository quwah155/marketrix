import { connectToDatabase } from "@/lib/mongoose";
import { ReviewModel } from "@/server/models";
import { normalizeDoc } from "@/server/models/helpers";

export const reviewRepository = {
  async upsertByBuyerAndProduct(input: {
    buyerId: string;
    productId: string;
    rating: number;
    comment?: string;
  }) {
    await connectToDatabase();
    const doc = await ReviewModel.findOneAndUpdate(
      { buyerId: input.buyerId, productId: input.productId },
      {
        rating: input.rating,
        comment: input.comment,
        $setOnInsert: {
          buyerId: input.buyerId,
          productId: input.productId,
        },
      },
      { new: true, upsert: true }
    ).lean({ virtuals: true }) as any;
    return normalizeDoc(doc);
  },
};

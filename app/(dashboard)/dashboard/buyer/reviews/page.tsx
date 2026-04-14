import { requireBuyer } from "@/server/guards/auth.guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { submitReviewAction } from "@/server/actions/buyer.actions";
import Link from "next/link";
import { getBuyerReviewsData } from "@/services/buyer-query.service";

export default async function BuyerReviewsPage() {
  const user = await requireBuyer();
  const { orders, existingReviews } = await getBuyerReviewsData(user.id);

  const reviewsByProductId = new Map(
    existingReviews.map((review) => [review.productId, review])
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">My Reviews</h1>
        <p className="text-muted-foreground">Leave or update reviews for purchased products</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            You need at least one completed purchase to leave a review.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const existing = reviewsByProductId.get(order.product.id);

            return (
              <Card key={order.product.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    <Link
                      href={`/products/${order.product.slug}`}
                      className="hover:text-brand-500 transition-colors"
                    >
                      {order.product.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={submitReviewAction} className="space-y-3">
                    <input type="hidden" name="productId" value={order.product.id} />
                    <div>
                      <label className="text-sm font-medium block mb-1">Rating</label>
                      <select
                        name="rating"
                        defaultValue={existing?.rating ?? 5}
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                      >
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Very good</option>
                        <option value={3}>3 - Good</option>
                        <option value={2}>2 - Fair</option>
                        <option value={1}>1 - Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Comment</label>
                      <textarea
                        name="comment"
                        defaultValue={existing?.comment ?? ""}
                        rows={4}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        placeholder="Share your experience with this product"
                      />
                    </div>
                    <Button type="submit" size="sm">
                      {existing ? "Update Review" : "Submit Review"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { stripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongoose";
import { OrderModel } from "@/server/models";
import { normalizeDoc } from "@/server/models/helpers";
import { finalizeCheckoutSessionById } from "@/services/payment.service";

export async function getCheckoutOrderDetails(sessionId: string) {
  await finalizeCheckoutSessionById(sessionId);
  const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = stripeSession.metadata?.orderId;
  if (!orderId) return null;

  await connectToDatabase();
  const order = await OrderModel.findById(orderId)
    .populate({
      path: "productId",
      select: { title: 1, thumbnail: 1, fileUrl: 1, slug: 1 },
    })
    .lean({ virtuals: true }) as any;

  if (!order) return null;

  return normalizeDoc({
    ...order,
    product: normalizeDoc(order.productId as Record<string, unknown>),
  });
}

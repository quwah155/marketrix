import Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongoose";
import { stripe, calculateFees } from "@/lib/stripe";
import { OrderStatus } from "@/types/db";
import type { ApiResponse } from "@/types";
import { orderRepository } from "@/server/repositories/order.repository";
import { productRepository } from "@/server/repositories/product.repository";
import { OrderModel, VendorProfileModel } from "@/server/models";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function createCheckoutForProduct(input: {
  productId: string;
  buyerId: string;
  buyerEmail: string;
}) {
  const product = await productRepository.findPublishedByIdWithVendorUser(
    input.productId,
  );

  if (!product) {
    return { error: "Product not found", status: 404 as const };
  }

  if (product.vendor.userId === input.buyerId) {
    return {
      error: "You cannot purchase your own product",
      status: 400 as const,
    };
  }

  const existingOrder = await orderRepository.findCompletedByBuyerAndProduct(
    input.buyerId,
    input.productId,
  );

  if (existingOrder) {
    return {
      error: "You have already purchased this product",
      status: 400 as const,
    };
  }

  const order = await orderRepository.createPending({
    buyerId: input.buyerId,
    productId: input.productId,
    amount: product.price,
    platformFee: parseFloat((product.price * 0.15).toFixed(2)),
    vendorEarning: parseFloat((product.price * 0.85).toFixed(2)),
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.title,
            description: product.description.slice(0, 255),
            images: product.thumbnail ? [product.thumbnail] : [],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId: order.id,
      productId: input.productId,
      buyerId: input.buyerId,
      vendorId: product.vendorId,
    },
    customer_email: input.buyerEmail,
    success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/products/${product.slug}?canceled=true`,
  });

  await orderRepository.linkStripeSession(order.id, checkoutSession.id);

  return { url: checkoutSession.url };
}

export async function processStripeWebhook(body: string, signature: string) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return { error: "Missing STRIPE_WEBHOOK_SECRET", status: 500 as const };
  }

  console.log("webhook received");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    console.log("EVENT TYPE:", event.type);
  } catch {
    return { error: "Webhook signature mismatch", status: 400 as const };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout session completed for session ID:", session.id);
      await finalizeCheckoutSession(session);
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.orderId) {
        await orderRepository.markPendingFailed(session.metadata.orderId);
      }
      break;
    }
    default:
      console.log("Unhandled event type:", event.type);
  }

  return { success: true as const };
}

export async function finalizeCheckoutSession(session: Stripe.Checkout.Session) {
  console.log("session metadata:", session.metadata);

  const { orderId, vendorId } = session.metadata ?? {};
  if (!orderId || !vendorId) {
    console.log("missing metadata - skipping");
    return null;
  }

  if (session.payment_status !== "paid") {
    console.log("session not paid yet - skipping", session.id, session.payment_status);
    return null;
  }

  const order = await orderRepository.findById(orderId);
  if (!order) {
    console.log("Order not found:", orderId);
    return null;
  }

  if (order.status === "COMPLETED") {
    console.log("Order already completed:", orderId);
    return order;
  }

  console.log("Processing order:", orderId);

  const { platformFee, vendorEarning } = calculateFees(order.amount);
  const completedOrder = await orderRepository.completeAndCreditVendor({
    orderId,
    platformFee,
    vendorEarning,
    stripeSessionId: session.id,
    vendorId,
  });

  if (!completedOrder) {
    console.log("order completion skipped because it was already processed:", orderId);
    return orderRepository.findById(orderId);
  }

  console.log("Order completed and vendor credited");
  return completedOrder;
}

export async function finalizeCheckoutSessionById(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return finalizeCheckoutSession(session);
}

export async function syncVendorOrderPaymentStatus(input: {
  userId: string;
  orderId: string;
}): Promise<ApiResponse<{ id: string; status: OrderStatus }>> {
  await connectToDatabase();

  const vendorProfile = await VendorProfileModel.findOne({ userId: input.userId })
    .select({ _id: 1 })
    .lean() as { _id?: { toString(): string } } | null;

  if (!vendorProfile?._id) {
    return { success: false, error: "Vendor profile not found" };
  }

  const order = await OrderModel.findById(input.orderId)
    .populate({ path: "productId", select: { vendorId: 1 } })
    .select({ _id: 1, status: 1, stripeSessionId: 1, productId: 1 })
    .lean({ virtuals: true }) as any;

  if (!order) {
    return { success: false, error: "Order not found" };
  }

  const product = order.productId as Record<string, unknown> | null;
  const productVendorId = product?.vendorId?.toString?.();
  if (!productVendorId || productVendorId !== vendorProfile._id.toString()) {
    return { success: false, error: "You do not have access to this order" };
  }

  if (order.status === OrderStatus.COMPLETED) {
    return {
      success: true,
      data: { id: order.id ?? order._id?.toString(), status: OrderStatus.COMPLETED },
      message: "Order is already completed",
    };
  }

  if (!order.stripeSessionId) {
    return { success: false, error: "Missing Stripe session for this order" };
  }

  const finalizedOrder = await finalizeCheckoutSessionById(order.stripeSessionId);
  if (!finalizedOrder) {
    return { success: false, error: "Payment is not marked as paid in Stripe yet" };
  }

  return {
    success: true,
    data: { id: finalizedOrder.id, status: finalizedOrder.status as OrderStatus },
    message:
      finalizedOrder.status === OrderStatus.COMPLETED
        ? "Order synced successfully"
        : "Order checked, but payment is still pending",
  };
}

import Stripe from "stripe";
import { stripe, calculateFees } from "@/lib/stripe";
import { orderRepository } from "@/server/repositories/order.repository";
import { productRepository } from "@/server/repositories/product.repository";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function createCheckoutForProduct(input: {
  productId: string;
  buyerId: string;
  buyerEmail: string;
}) {
  const product = await productRepository.findPublishedByIdWithVendorUser(
    input.productId
  );

  if (!product) {
    return { error: "Product not found", status: 404 as const };
  }

  if (product.vendor.userId === input.buyerId) {
    return { error: "You cannot purchase your own product", status: 400 as const };
  }

  const existingOrder = await orderRepository.findCompletedByBuyerAndProduct(
    input.buyerId,
    input.productId
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
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("EVENT TYPE:", event.type);
  } catch {
    return { error: "Webhook signature mismatch", status: 400 as const };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout session completed for session ID:", session.id);
      await handleCheckoutComplete(session);
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
  console.log(" Unhandled event type:", event.type); 
  }

  return { success: true as const };
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {

  console.log("session metadata:", session.metadata);
  const { orderId, vendorId } = session.metadata ?? {};

  if (!orderId || !vendorId){
    console.log("missing metadata - skipping");
    return;
  }

  const order = await orderRepository.findById(orderId);

  if (!order) {
    console.log("❌ Order not found:", orderId);
    return;
  }

  if (order.status === "COMPLETED") {
    console.log("⚠️ Order already completed:", orderId);
    return;
  }

  console.log("✅ Processing order:", orderId);

  const { platformFee, vendorEarning } = calculateFees(order.amount);

  await orderRepository.completeAndCreditVendor({
    orderId,
    platformFee,
    vendorEarning,
    stripeSessionId: session.id,
    vendorId,
  });

  console.log("🎉 Order completed and vendor credited");
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { applyRateLimit, csrfErrorResponse, validateSameOrigin } from "@/lib/security";
import { createCheckoutForProduct } from "@/services/payment.service";
import { z } from "zod";

const bodySchema = z.object({
  productId: z.string().cuid(),
});

export async function POST(req: NextRequest) {
  try {
    if (!validateSameOrigin(req)) {
      return csrfErrorResponse();
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitResponse = await applyRateLimit({
      req,
      prefix: "stripe-checkout",
      identifier: session.user.id,
      limit: 15,
      windowSeconds: 60,
    });
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const { productId } = bodySchema.parse(body);

    const result = await createCheckoutForProduct({
      productId,
      buyerId: session.user.id,
      buyerEmail: session.user.email,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("[Stripe Checkout]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

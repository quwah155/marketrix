"use server";

import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/types";
import { OrderStatus } from "@/types/db";
import { requireVendor } from "@/server/guards/auth.guard";
import { syncVendorOrderPaymentStatus } from "@/services/payment.service";

export async function syncVendorOrder(
  orderId: string,
): Promise<ApiResponse<{ id: string; status: OrderStatus }>> {
  const user = await requireVendor();

  const result = await syncVendorOrderPaymentStatus({
    userId: user.id,
    orderId,
  });
  if (!result.success) return result;

  revalidatePath("/dashboard/vendor");
  revalidatePath("/dashboard/vendor/orders");
  revalidatePath("/dashboard/vendor/balance");
  revalidatePath("/dashboard/buyer/orders");
  revalidatePath("/dashboard/buyer/downloads");

  return result;
}

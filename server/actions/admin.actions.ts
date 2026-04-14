"use server";

import { revalidatePath } from "next/cache";
import { OrderStatus } from "@/types/db";
import { requireAdmin } from "@/server/guards/auth.guard";
import type { ApiResponse } from "@/types";
import { DisputeResolution, resolveOrderDispute } from "@/services/dispute.service";

export async function resolveDispute(
  orderId: string,
  resolution: DisputeResolution
): Promise<ApiResponse<{ id: string; status: OrderStatus }>> {
  await requireAdmin();

  const result = await resolveOrderDispute(orderId, resolution);
  if (!result.success) return result;

  revalidatePath("/admin/disputes");
  revalidatePath("/admin");

  return result;
}

export async function resolveDisputeAction(
  orderId: string,
  resolution: DisputeResolution
): Promise<void> {
  await resolveDispute(orderId, resolution);
}

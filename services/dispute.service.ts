import { OrderStatus } from "@/types/db";
import type { ApiResponse } from "@/types";
import { orderRepository } from "@/server/repositories/order.repository";

export type DisputeResolution = "mark_completed" | "mark_refunded";

export async function resolveOrderDispute(
  orderId: string,
  resolution: DisputeResolution
): Promise<ApiResponse<{ id: string; status: OrderStatus }>> {
  const targetStatus =
    resolution === "mark_completed" ? OrderStatus.COMPLETED : OrderStatus.REFUNDED;

  const order = await orderRepository.updateStatus(orderId, targetStatus);
  if (!order) throw new Error("Order not found");
  return { success: true, data: order };
}

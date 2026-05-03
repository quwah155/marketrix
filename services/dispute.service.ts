import { OrderStatus } from "@/types/db";
import type { ApiResponse } from "@/types";
import { orderRepository } from "@/server/repositories/order.repository";
import { vendorProfileRepository } from "@/server/repositories/vendor-profile.repository";

export type DisputeResolution = "mark_completed" | "mark_refunded";

export async function resolveOrderDispute(
  orderId: string,
  resolution: DisputeResolution
): Promise<ApiResponse<{ id: string; status: OrderStatus }>> {
  const targetStatus =
    resolution === "mark_completed" ? OrderStatus.COMPLETED : OrderStatus.REFUNDED;

  const existingOrder = await orderRepository.findByIdWithProductVendor(orderId) as {
    id: string;
    status: OrderStatus;
    vendorEarning: number;
    product?: { vendorId: string | null } | null;
  } | null;

  if (!existingOrder) {
    return { success: false, error: "Order not found" };
  }

  if (existingOrder.status === targetStatus) {
    return {
      success: true,
      data: { id: existingOrder.id, status: targetStatus },
      message: "Order already has this status",
    };
  }

  const shouldCreditVendor =
    existingOrder.status !== OrderStatus.COMPLETED &&
    targetStatus === OrderStatus.COMPLETED;
  const shouldDebitVendor =
    existingOrder.status === OrderStatus.COMPLETED &&
    targetStatus === OrderStatus.REFUNDED;

  if ((shouldCreditVendor || shouldDebitVendor) && existingOrder.product?.vendorId) {
    const balanceDelta = shouldCreditVendor
      ? existingOrder.vendorEarning
      : -existingOrder.vendorEarning;
    await vendorProfileRepository.incrementBalance(
      existingOrder.product.vendorId,
      balanceDelta
    );
  }

  const updatedOrder = await orderRepository.updateStatus(orderId, targetStatus);
  if (!updatedOrder) {
    return { success: false, error: "Order not found" };
  }

  return { success: true, data: updatedOrder };
}

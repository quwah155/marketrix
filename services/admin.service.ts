import { OrderStatus, Role } from "@/types/db";
import { connectToDatabase } from "@/lib/mongoose";
import { OrderModel, ProductModel, UserModel } from "@/server/models";
import { normalizeDoc, normalizeDocs } from "@/server/models/helpers";

export async function getAdminDashboardData() {
  await connectToDatabase();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalRevenue,
    totalFees,
    vendorCount,
    buyerCount,
    activeProducts,
    ordersThisMonth,
    recentOrders,
    recentUsers,
    monthlyOrders,
  ] = await Promise.all([
    OrderModel.aggregate([
      { $match: { status: OrderStatus.COMPLETED } },
      { $group: { _id: null, amount: { $sum: "$amount" } } },
    ]),
    OrderModel.aggregate([
      { $match: { status: OrderStatus.COMPLETED } },
      { $group: { _id: null, platformFee: { $sum: "$platformFee" } } },
    ]),
    UserModel.countDocuments({ role: Role.VENDOR }),
    UserModel.countDocuments({ role: Role.BUYER }),
    ProductModel.countDocuments({ status: "PUBLISHED" }),
    OrderModel.countDocuments({
      status: OrderStatus.COMPLETED,
      createdAt: { $gte: startOfMonth },
    }),
    OrderModel.find({ status: OrderStatus.COMPLETED })
      .populate({ path: "buyerId", select: { name: 1, email: 1 } })
      .populate({ path: "productId", select: { title: 1 } })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean({ virtuals: true }) as any,
    UserModel.find().sort({ createdAt: -1 }).limit(5).lean({ virtuals: true }) as any,
    OrderModel.find({
      status: OrderStatus.COMPLETED,
      createdAt: { $gte: sixMonthsAgo },
    })
      .select({ amount: 1, platformFee: 1, createdAt: 1 })
      .sort({ createdAt: 1 })
      .lean({ virtuals: true }) as any,
  ]);

  const totalRevenueSum = totalRevenue[0]?.amount ?? 0;
  const totalFeesSum = totalFees[0]?.platformFee ?? 0;

  const monthMap = new Map<string, { revenue: number; fees: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    monthMap.set(key, { revenue: 0, fees: 0 });
  }

  monthlyOrders.forEach((order: { createdAt: string | Date; amount: number; platformFee: number }) => {
    const key = new Date(order.createdAt).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
    const entry = monthMap.get(key);
    if (entry) {
      entry.revenue += order.amount;
      entry.fees += order.platformFee;
    }
  });

  const chartData = Array.from(monthMap.entries()).map(([month, data]) => ({
    month,
    ...data,
  }));

  return {
    totalRevenue: { _sum: { amount: totalRevenueSum } },
    totalFees: { _sum: { platformFee: totalFeesSum } },
    vendorCount,
    buyerCount,
    activeProducts,
    ordersThisMonth,
    recentOrders: normalizeDocs(
      recentOrders.map((order: Record<string, unknown>) => ({
        ...order,
        buyer: normalizeDoc(order.buyerId as Record<string, unknown>),
        product: normalizeDoc(order.productId as Record<string, unknown>),
      }))
    ),
    recentUsers: normalizeDocs(recentUsers),
    chartData,
  };
}

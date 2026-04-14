import { requireVendor } from "@/server/guards/auth.guard";
import { formatPrice, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { Wallet, ArrowDownToLine, DollarSign, Clock } from "lucide-react";
import { getVendorBalanceData } from "@/services/vendor-query.service";

export default async function VendorBalancePage() {
  const user = await requireVendor();
  const data = await getVendorBalanceData(user.id);
  if (!data) return null;
  const { vendorProfile, completedOrders } = data;

  const totalEarned = completedOrders.reduce((s, o) => s + o.vendorEarning, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Balance & Withdrawals</h1>
        <p className="text-muted-foreground">Manage your earnings and request payouts</p>
      </div>

      {/* Balance card */}
      <Card className="bg-gradient-to-br from-brand-500 to-purple-600 text-white border-0">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-brand-100 text-sm font-medium mb-1">Available Balance</p>
              <p className="text-4xl font-bold">{formatPrice(vendorProfile.balance)}</p>
              <p className="text-brand-200 text-sm mt-2">Total earned: {formatPrice(totalEarned)}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-6">
            <Button
              variant="secondary"
              className="bg-white text-brand-600 hover:bg-brand-50 border-0"
              leftIcon={<ArrowDownToLine className="h-4 w-4" />}
              disabled={vendorProfile.balance < 10}
            >
              {vendorProfile.balance >= 10 ? "Request Withdrawal" : "Minimum $10 to withdraw"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Platform Fee", value: "15%", icon: DollarSign, desc: "Deducted per sale" },
          { label: "Your Cut", value: "85%", icon: Wallet, desc: "Per transaction" },
          { label: "Payout Time", value: "3–5 days", icon: Clock, desc: "Business days" },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-5">
              <item.icon className="h-5 w-5 text-brand-500 mb-2" />
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transaction history */}
      <Card>
        <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
        <CardContent>
          {completedOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {completedOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-4 rounded-xl p-3 hover:bg-muted transition-colors">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{order.product.title}</p>
                    <p className="text-xs text-muted-foreground">{order.buyer.name} · {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">+{formatPrice(order.vendorEarning)}</p>
                    <Badge variant="success" className="text-[10px]">Completed</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

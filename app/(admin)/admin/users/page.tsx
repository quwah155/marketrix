import { requireAdmin } from "@/server/guards/auth.guard";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";
import { Role } from "@/types/db";
import { AdminUserActions } from "@/components/admin/user-actions";
import { getAdminUsersData } from "@/services/admin-query.service";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await getAdminUsersData();

  const roleVariant = (r: Role) => r === "ADMIN" ? "danger" : r === "VENDOR" ? "default" : "secondary";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">{users.length} registered users</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["User", "Role", "Orders", "Email Verified", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={roleVariant(u.role)}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-4 text-sm">{u._count.orders}</td>
                  <td className="px-5 py-4">
                    <Badge variant={u.emailVerified ? "success" : "warning"}>{u.emailVerified ? "Verified" : "Pending"}</Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-4">
                    <AdminUserActions userId={u.id} currentRole={u.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

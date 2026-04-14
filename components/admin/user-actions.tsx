"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Role } from "@/types/db";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


export function AdminUserActions({ userId, currentRole }: { userId: string; currentRole: Role }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleRoleChange(newRole: Role) {
    setLoading(newRole);
    try {
      const fd = new FormData();
      fd.append("userId", userId);
      fd.append("role", newRole);
      const res = await fetch("/api/admin/users/role", { method: "POST", body: fd });
      if (!res.ok) { toast.error("Failed to update role"); return; }
      toast.success(`Role changed to ${newRole}`);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {currentRole !== Role.VENDOR && (
        <Button variant="outline" size="sm" isLoading={loading === Role.VENDOR} onClick={() => handleRoleChange(Role.VENDOR)}>→ Vendor</Button>
      )}
      {currentRole !== Role.BUYER && (
        <Button variant="secondary" size="sm" isLoading={loading === Role.BUYER} onClick={() => handleRoleChange(Role.BUYER)}>→ Buyer</Button>
      )}
      {currentRole !== Role.ADMIN && (
        <Button variant="danger" size="sm" isLoading={loading === Role.ADMIN} onClick={() => handleRoleChange(Role.ADMIN)}>→ Admin</Button>
      )}
    </div>
  );
}

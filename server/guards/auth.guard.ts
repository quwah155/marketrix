"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@/types/db";
import { redirect } from "next/navigation";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }
  return user;
}

export async function requireVendor() {
  return requireRole([Role.VENDOR, Role.ADMIN]);
}

export async function requireAdmin() {
  return requireRole([Role.ADMIN]);
}

export async function requireBuyer() {
  return requireRole([Role.BUYER, Role.ADMIN]);
}

export async function withAuth<TArgs extends unknown[], TReturn>(
  handler: (user: Awaited<ReturnType<typeof requireAuth>>, ...args: TArgs) => Promise<TReturn>,
  allowedRoles?: Role[]
): Promise<(...args: TArgs) => Promise<TReturn>> {
  // Eagerly validate the caller's session so wrong-role callers fail early
  const user = allowedRoles
    ? await requireRole(allowedRoles)
    : await requireAuth();
  return async (...args: TArgs): Promise<TReturn> => handler(user, ...args);
}

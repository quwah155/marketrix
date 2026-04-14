import { Role } from "@/types/db";
import type { ApiResponse } from "@/types";
import { userRepository } from "@/server/repositories/user.repository";
import { vendorProfileRepository } from "@/server/repositories/vendor-profile.repository";

export async function updateUserRoleByAdmin(input: {
  actorId: string;
  userId: string;
  role: Role;
}): Promise<ApiResponse<null>> {
  if (input.userId === input.actorId) {
    return { success: false, error: "Cannot change your own role" };
  }

  await userRepository.updateRole(input.userId, input.role);

  if (input.role === Role.VENDOR) {
    await vendorProfileRepository.upsertForUser(input.userId);
  }

  return { success: true, data: null };
}

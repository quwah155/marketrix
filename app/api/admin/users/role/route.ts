import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { applyRateLimit, csrfErrorResponse, validateSameOrigin } from "@/lib/security";
import { z } from "zod";
import { Role } from "@/types/db";
import { updateUserRoleByAdmin } from "@/services/admin-user.service";

const schema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID"),
  role: z.nativeEnum(Role),
});

export async function POST(req: NextRequest) {
  if (!validateSameOrigin(req)) {
    return csrfErrorResponse();
  }

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const rateLimitResponse = await applyRateLimit({
    req,
    prefix: "admin-role-change",
    identifier: session.user.id,
    limit: 40,
    windowSeconds: 60,
  });
  if (rateLimitResponse) return rateLimitResponse;

  const formData = await req.formData();
  const result = schema.safeParse({ userId: formData.get("userId"), role: formData.get("role") });
  if (!result.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { userId, role } = result.data;

  const response = await updateUserRoleByAdmin({
    actorId: session.user.id,
    userId,
    role,
  });
  if (!response.success) {
    return NextResponse.json({ error: response.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

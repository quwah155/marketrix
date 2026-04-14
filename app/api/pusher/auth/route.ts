import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { applyRateLimit, csrfErrorResponse, validateSameOrigin } from "@/lib/security";
import { canUserAccessThread } from "@/services/messaging.service";

export async function POST(req: NextRequest) {
  if (!validateSameOrigin(req)) {
    return csrfErrorResponse();
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimitResponse = await applyRateLimit({
    req,
    prefix: "pusher-auth",
    identifier: session.user.id,
    limit: 120,
    windowSeconds: 60,
  });
  if (rateLimitResponse) return rateLimitResponse;

  const data = await req.text();
  const params = new URLSearchParams(data);
  const socketId = params.get("socket_id") ?? "";
  const channelName = params.get("channel_name") ?? "";

  if (!socketId || !channelName) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Ensure users can only subscribe to their own presence/private user channels
  if (channelName.includes(session.user.id)) {
    const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
      user_id: session.user.id,
      user_info: { name: session.user.name },
    });
    return NextResponse.json(authResponse);
  }

  // private-thread-<threadId>
  if (!channelName.startsWith("private-thread-")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const threadId = channelName.replace("private-thread-", "");
  const canAccess = await canUserAccessThread(threadId, session.user.id);
  if (!canAccess) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
    user_id: session.user.id,
    user_info: { name: session.user.name },
  });

  return NextResponse.json(authResponse);
}

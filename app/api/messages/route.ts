import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { applyRateLimit, csrfErrorResponse, validateSameOrigin } from "@/lib/security";
import { z } from "zod";
import { fetchThreadMessages, sendThreadMessage } from "@/services/messaging.service";

const sendMessageSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required"),
  content: z.string().min(1, "Message cannot be empty").max(2000),
});

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
    prefix: "messages-send",
    identifier: session.user.id,
    limit: 80,
    windowSeconds: 60,
  });
  if (rateLimitResponse) return rateLimitResponse;

  const body = await req.json();
  const result = sendMessageSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { threadId, content } = result.data;

  const messageResponse = await sendThreadMessage({
    threadId,
    senderId: session.user.id,
    content,
  });
  if (!messageResponse.success) {
    const status =
      messageResponse.error === "Thread not found"
        ? 404
        : messageResponse.error === "Forbidden"
        ? 403
        : 400;
    return NextResponse.json({ error: messageResponse.error }, { status });
  }
  const message = messageResponse.data;

  return NextResponse.json({
    id: message.id,
    content: message.content,
    createdAt: message.createdAt,
    read: message.read,
    sender: message.sender,
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");

  if (!threadId) {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 });
  }

  const messagesResponse = await fetchThreadMessages({
    threadId,
    requesterId: session.user.id,
  });
  if (!messagesResponse.success) {
    const status = messagesResponse.error === "Forbidden" ? 403 : 404;
    return NextResponse.json({ error: messagesResponse.error }, { status });
  }

  return NextResponse.json(messagesResponse.data);
}

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import type { ApiResponse } from "@/types";
import {
  getOrCreateThreadByBuyerVendor,
  getUserThreads,
  sendThreadMessage,
} from "@/services/messaging.service";

const sendMessageSchema = z.object({
  threadId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export interface SentMessage {
  id: string;
  content: string;
  createdAt: Date;
  read: boolean;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

/**
 * Send a message in a thread.
 * Persists to DB + triggers Pusher real-time event.
 */
export async function sendMessage(
  threadId: string,
  content: string
): Promise<ApiResponse<SentMessage>> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "You must be signed in to send messages" };
  }

  const result = sendMessageSchema.safeParse({ threadId, content });
  if (!result.success) {
    return {
      success: false,
      error: "Invalid input",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  return sendThreadMessage({
    threadId,
    senderId: session.user.id,
    content,
  });
}

/**
 * Get or create a message thread between the current user (buyer) and a vendor.
 */
export async function getOrCreateMessageThread(
  vendorUserId: string
): Promise<ApiResponse<{ threadId: string }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const buyerId = session.user.id;

  if (buyerId === vendorUserId) {
    return { success: false, error: "Cannot message yourself" };
  }

  return getOrCreateThreadByBuyerVendor({ buyerId, vendorUserId });
}

/**
 * Fetch all message threads for the current user.
 */
export async function getMyThreads(): Promise<
  ApiResponse<
    Array<{
      id: string;
      updatedAt: Date;
      other: { id: string; name: string | null; image: string | null };
      lastMessage: { content: string; createdAt: Date } | null;
    }>
  >
> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const threads = await getUserThreads(session.user.id);

  return {
    success: true,
    data: threads.map((t) => ({
      id: t.id,
      updatedAt: t.updatedAt,
      other: t.buyerId === session.user.id ? t.vendor : t.buyer,
      lastMessage: t.messages[0]
        ? { content: t.messages[0].content, createdAt: t.messages[0].createdAt }
        : null,
    })),
  };
}

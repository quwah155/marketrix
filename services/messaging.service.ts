import { getThreadChannelName, pusherServer } from "@/lib/pusher";
import type { ApiResponse, MessageWithSender } from "@/types";
import { messageRepository } from "@/server/repositories/message.repository";
import { messageThreadRepository } from "@/server/repositories/message-thread.repository";
import { userRepository } from "@/server/repositories/user.repository";
import { vendorProfileRepository } from "@/server/repositories/vendor-profile.repository";

async function getAuthorizedThreadForUser(threadId: string, userId: string) {
  const thread = await messageThreadRepository.findById(threadId);
  if (!thread) return null;

  if (thread.buyerId === userId || thread.vendorId === userId) {
    return thread;
  }

  const vendorProfile = await vendorProfileRepository.findByUserId(userId);
  if (vendorProfile?.id) {
    const updates: { buyerId?: string; vendorId?: string } = {};

    if (thread.vendorId === vendorProfile.id) {
      updates.vendorId = userId;
    }

    if (thread.buyerId === vendorProfile.id) {
      updates.buyerId = userId;
    }

    if (updates.buyerId || updates.vendorId) {
      await messageThreadRepository.updateParticipants(threadId, updates);
      return messageThreadRepository.findById(threadId);
    }
  }

  return null;
}

export async function canUserAccessThread(
  threadId: string,
  userId: string
): Promise<boolean> {
  const thread = await getAuthorizedThreadForUser(threadId, userId);
  return !!thread;
}

export async function sendThreadMessage(input: {
  threadId: string;
  senderId: string;
  content: string;
}): Promise<ApiResponse<MessageWithSender>> {
  const thread = await getAuthorizedThreadForUser(input.threadId, input.senderId);
  if (!thread) {
    return { success: false, error: "Forbidden" };
  }

  const message = await messageRepository.createAndBumpThread({
    threadId: input.threadId,
    senderId: input.senderId,
    content: input.content.trim(),
  });
  if (!message) {
    return { success: false, error: "Failed to create message" };
  }

  try {
    await pusherServer.trigger(getThreadChannelName(input.threadId), "new-message", {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      read: message.read,
      sender: message.sender,
    });
  } catch (err) {
    console.error("[Pusher] Failed to trigger message event:", err);
  }

  return {
    success: true,
    data: {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      read: message.read,
      sender: message.sender,
    },
  };
}

export async function fetchThreadMessages(input: {
  threadId: string;
  requesterId: string;
}): Promise<ApiResponse<MessageWithSender[]>> {
  const canAccess = await canUserAccessThread(input.threadId, input.requesterId);
  if (!canAccess) {
    return { success: false, error: "Forbidden" };
  }

  const messages = await messageRepository.findByThread(input.threadId);
  await messageRepository.markUnreadAsRead(input.threadId, input.requesterId);

  return { success: true, data: messages };
}

export async function getOrCreateThreadByBuyerVendor(input: {
  buyerId: string;
  vendorUserId: string;
}): Promise<ApiResponse<{ threadId: string }>> {
  if (input.buyerId === input.vendorUserId) {
    return { success: false, error: "Cannot message yourself" };
  }

  const vendor = await userRepository.findById(input.vendorUserId);
  if (!vendor) {
    return { success: false, error: "Vendor not found" };
  }

  const vendorProfile = await vendorProfileRepository.findByUserId(input.vendorUserId);
  const vendorCandidates = [input.vendorUserId];
  if (vendorProfile?.id) {
    vendorCandidates.push(vendorProfile.id);
  }

  const existing = await messageThreadRepository.findBuyerVendorThreadByCandidates(
    input.buyerId,
    vendorCandidates
  );

  if (existing) {
    if (existing.vendorId !== input.vendorUserId) {
      await messageThreadRepository.updateVendorId(existing.id, input.vendorUserId);
    }
    return { success: true, data: { threadId: existing.id } };
  }

  const thread = await messageThreadRepository.create(input.buyerId, input.vendorUserId);
  return { success: true, data: { threadId: thread.id } };
}

export async function getUserThreads(userId: string) {
  return messageThreadRepository.findForUserWithLastMessage(userId);
}

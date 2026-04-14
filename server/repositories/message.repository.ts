import { connectToDatabase } from "@/lib/mongoose";
import { MessageModel, MessageThreadModel } from "@/server/models";
import { normalizeDoc, normalizeDocs } from "@/server/models/helpers";

type MessageDoc = Record<string, unknown> & {
  senderId?: unknown;
};

export const messageRepository = {
  async createWithSender(input: {
    threadId: string;
    senderId: string;
    content: string;
  }) {
    await connectToDatabase();
    const created = await MessageModel.create({
      threadId: input.threadId,
      senderId: input.senderId,
      content: input.content,
    });
    const doc = await MessageModel.findById(created._id)
      .populate({ path: "senderId", select: { name: 1, image: 1 } })
      .lean({ virtuals: true }) as any;
    if (!doc) return null;
    const sender = normalizeDoc(doc.senderId as Record<string, unknown>);
    return normalizeDoc({ ...doc, sender });
  },

  async createAndBumpThread(input: {
    threadId: string;
    senderId: string;
    content: string;
  }) {
    await connectToDatabase();
    const created = await MessageModel.create({
      threadId: input.threadId,
      senderId: input.senderId,
      content: input.content,
    });
    await MessageThreadModel.findByIdAndUpdate(input.threadId, {
      updatedAt: new Date(),
    });
    const doc = await MessageModel.findById(created._id)
      .populate({ path: "senderId", select: { name: 1, image: 1 } })
      .lean({ virtuals: true }) as any;
    if (!doc) return null;
    const sender = normalizeDoc(doc.senderId as Record<string, unknown>);
    return normalizeDoc({ ...doc, sender });
  },

  async findByThread(threadId: string) {
    await connectToDatabase();
    const docs = await MessageModel.find({ threadId })
      .populate({ path: "senderId", select: { name: 1, image: 1 } })
      .sort({ createdAt: 1 })
      .lean({ virtuals: true }) as MessageDoc[];
    return normalizeDocs(
      docs.map((doc: MessageDoc) => ({
        ...doc,
        sender: normalizeDoc(doc.senderId as Record<string, unknown>),
      }))
    );
  },

  async markUnreadAsRead(threadId: string, readerId: string) {
    await connectToDatabase();
    return MessageModel.updateMany(
      { threadId, senderId: { $ne: readerId }, read: false },
      { read: true }
    );
  },
};

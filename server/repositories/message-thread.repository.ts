import { connectToDatabase } from "@/lib/mongoose";
import { MessageThreadModel, VendorProfileModel } from "@/server/models";
import { normalizeDoc, normalizeDocs } from "@/server/models/helpers";

export interface MessageParticipant {
  id: string;
  name: string | null;
  image: string | null;
}

export interface ThreadMessage {
  id: string;
  content: string;
  createdAt: Date;
  read: boolean;
  senderId?: string;
  sender?: MessageParticipant;
}

export interface MessageThreadRecord {
  id: string;
  buyerId: string;
  vendorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageThreadParticipantsRecord {
  id: string;
  buyerId: string;
  vendorId: string;
}

export interface MessageThreadWithParticipants extends MessageThreadRecord {
  buyer: MessageParticipant;
  vendor: MessageParticipant;
  messages: ThreadMessage[];
}

type ThreadDoc = Record<string, unknown> & {
  buyerId?: unknown;
  vendorId?: unknown;
  messages?: Array<Record<string, unknown> & { senderId?: unknown }>;
};

function normalizeParticipant(value: unknown) {
  return normalizeDoc<MessageParticipant>(value as Record<string, unknown>);
}

function normalizeReferenceId(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const id = record.id ?? record._id;
    return id?.toString() ?? "";
  }
  return "";
}

function normalizeThread(
  doc: ThreadDoc,
  options?: { includeMessageSender?: boolean }
) {
  const buyer = normalizeParticipant(doc.buyerId);
  const vendor = normalizeParticipant(doc.vendorId);
  const messages = normalizeDocs<ThreadMessage>(
    (doc.messages ?? []).map((message) => ({
      ...message,
      senderId: normalizeReferenceId(message.senderId),
      ...(options?.includeMessageSender
        ? { sender: normalizeParticipant(message.senderId) }
        : {}),
    }))
  );

  return normalizeDoc<MessageThreadWithParticipants>({
    ...doc,
    buyerId: normalizeReferenceId(doc.buyerId),
    vendorId: normalizeReferenceId(doc.vendorId),
    buyer,
    vendor,
    messages,
  });
}

async function normalizeLegacyVendorThreadIdsForUser(userId: string) {
  const vendorProfile = await VendorProfileModel.findOne({ userId })
    .select({ _id: 1 })
    .lean() as { _id?: { toString(): string } } | null;

  const vendorProfileId = vendorProfile?._id?.toString();
  if (!vendorProfileId || vendorProfileId === userId) return;

  await MessageThreadModel.updateMany(
    { vendorId: vendorProfileId },
    { vendorId: userId },
  );
}

export const messageThreadRepository = {
  async findById(threadId: string) {
    await connectToDatabase();
    const doc = await MessageThreadModel.findById(threadId).lean({
      virtuals: true,
    });
    if (!doc) return null;
    return normalizeDoc<MessageThreadRecord>(doc);
  },

  async findByIdWithParticipants(threadId: string) {
    await connectToDatabase();
    const doc = await MessageThreadModel.findById(threadId)
      .select({ buyerId: 1, vendorId: 1 })
      .lean({ virtuals: true });
    if (!doc) return null;
    return normalizeDoc<MessageThreadParticipantsRecord>(doc);
  },

  async findBuyerVendorThread(buyerId: string, vendorId: string) {
    await connectToDatabase();
    const doc = await MessageThreadModel.findOne({ buyerId, vendorId }).lean({
      virtuals: true,
    });
    if (!doc) return null;
    return normalizeDoc<MessageThreadRecord>(doc);
  },

  async findEitherDirectionThread(userAId: string, userBId: string) {
    await connectToDatabase();
    const doc = await MessageThreadModel.findOne({
      $or: [
        { buyerId: userAId, vendorId: userBId },
        { buyerId: userBId, vendorId: userAId },
      ],
    }).lean({ virtuals: true });
    if (!doc) return null;
    return normalizeDoc<MessageThreadRecord>(doc);
  },

  async findBuyerVendorThreadByCandidates(buyerId: string, vendorIds: string[]) {
    await connectToDatabase();
    const doc = await MessageThreadModel.findOne({
      buyerId,
      vendorId: { $in: vendorIds },
    }).lean({ virtuals: true });
    if (!doc) return null;
    return normalizeDoc<MessageThreadRecord>(doc);
  },

  async create(buyerId: string, vendorId: string) {
    await connectToDatabase();
    const doc = await MessageThreadModel.create({ buyerId, vendorId });
    return normalizeDoc<MessageThreadRecord>(doc.toObject());
  },

  async updateVendorId(threadId: string, vendorId: string) {
    await connectToDatabase();
    const doc = await MessageThreadModel.findByIdAndUpdate(
      threadId,
      { vendorId },
      { new: true }
    ).lean({ virtuals: true });
    if (!doc) return null;
    return normalizeDoc<MessageThreadRecord>(doc);
  },

  async updateParticipants(
    threadId: string,
    updates: { buyerId?: string; vendorId?: string }
  ) {
    await connectToDatabase();
    const doc = await MessageThreadModel.findByIdAndUpdate(
      threadId,
      updates,
      { new: true }
    ).lean({ virtuals: true });
    if (!doc) return null;
    return normalizeDoc<MessageThreadRecord>(doc);
  },

  async updateTimestamp(threadId: string) {
    await connectToDatabase();
    const doc = await MessageThreadModel.findByIdAndUpdate(
      threadId,
      { updatedAt: new Date() },
      { new: true }
    ).lean({ virtuals: true });
    if (!doc) return null;
    return normalizeDoc<MessageThreadRecord>(doc);
  },

  async findForUserWithLastMessage(userId: string) {
    await connectToDatabase();
    await normalizeLegacyVendorThreadIdsForUser(userId);
    const docs = await MessageThreadModel.find({
      $or: [{ buyerId: userId }, { vendorId: userId }],
    })
      .populate({ path: "buyerId", select: { name: 1, image: 1 } })
      .populate({ path: "vendorId", select: { name: 1, image: 1 } })
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 }, limit: 1 },
        select: { content: 1, createdAt: 1, senderId: 1, read: 1 },
      })
      .sort({ updatedAt: -1 })
      .lean({ virtuals: true }) as ThreadDoc[];

    return docs.map((doc) => normalizeThread(doc));
  },

  async findByIdForUserWithMessages(threadId: string, userId: string) {
    await connectToDatabase();
    await normalizeLegacyVendorThreadIdsForUser(userId);
    const doc = await MessageThreadModel.findOne({
      _id: threadId,
      $or: [{ buyerId: userId }, { vendorId: userId }],
    })
      .populate({ path: "buyerId", select: { name: 1, image: 1 } })
      .populate({ path: "vendorId", select: { name: 1, image: 1 } })
      .populate({
        path: "messages",
        options: { sort: { createdAt: 1 } },
        select: { content: 1, createdAt: 1, senderId: 1, read: 1 },
        populate: { path: "senderId", select: { name: 1, image: 1 } },
      })
      .lean({ virtuals: true }) as ThreadDoc | null;

    if (!doc) return null;
    return normalizeThread(doc, { includeMessageSender: true });
  },
};

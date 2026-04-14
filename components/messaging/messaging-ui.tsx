"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatRelativeDate } from "@/lib/utils";
import { sendMessage } from "@/server/actions/message.actions";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import type { MessageWithSender } from "@/types";

interface MessagingUIProps {
  threadId: string;
  initialMessages: MessageWithSender[];
}

export function MessagingUI({ threadId, initialMessages }: MessagingUIProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keep the local message list aligned when the active thread changes.
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, threadId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Pusher real-time subscription
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: "/api/pusher/auth",
    });

    const channel = pusher.subscribe(`private-thread-${threadId}`);
    channel.bind("new-message", (data: MessageWithSender) => {
      setMessages((prev) => {
        if (prev.some((message) => message.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-thread-${threadId}`);
      pusher.disconnect();
    };
  }, [threadId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    const messageContent = content.trim();
    setContent("");

    try {
      const result = await sendMessage(threadId, messageContent);
      if (!result.success) {
        toast.error(result.error);
        setContent(messageContent);
        return;
      }

      setMessages((prev) => {
        if (prev.some((message) => message.id === result.data.id)) return prev;
        return [...prev, result.data];
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No messages yet. Start the conversation.
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender.id === session?.user?.id;
          return (
            <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
              <div className={cn("flex gap-2 max-w-[75%]", isOwn ? "flex-row-reverse" : "flex-row")}>
                <div className="h-7 w-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                  {msg.sender.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm",
                      isOwn
                        ? "bg-brand-500 text-white rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 px-1">
                    {formatRelativeDate(msg.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
        <Input
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" isLoading={sending} disabled={!content.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

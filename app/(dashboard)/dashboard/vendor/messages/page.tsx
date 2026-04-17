import { requireVendor } from "@/server/guards/auth.guard";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MessagingUI } from "@/components/messaging/messaging-ui";
import { MessageSquare } from "lucide-react";
import { getVendorMessagesData } from "@/services/vendor-query.service";
import type { MessageWithSender } from "@/types";

interface Props {
  searchParams: Promise<{ thread?: string }>;
}

export default async function VendorMessagesPage(props: Props) {
  const searchParams = await props.searchParams;
  const user = await requireVendor();
  const activeThreadId = searchParams.thread;

  const { threads, activeThread } = await getVendorMessagesData(user.id, activeThreadId);

  const otherParticipant = (thread: (typeof threads)[number]) =>
    thread.buyerId === user.id ? thread.vendor : thread.buyer;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">{threads.length} conversations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[680px]">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Conversations</CardTitle>
          </CardHeader>
          <div className="overflow-y-auto h-full pb-4">
            {threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              threads.map((thread) => {
                const other = otherParticipant(thread);
                const lastMsg = thread.messages[0];
                return (
                  <a
                    key={thread.id}
                    href={`?thread=${thread.id}`}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors border-b border-border ${
                      activeThreadId === thread.id ? "bg-brand-50 dark:bg-brand-950" : ""
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {other.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{other.name}</p>
                      {lastMsg && (
                        <p className="text-xs text-muted-foreground truncate">{lastMsg.content}</p>
                      )}
                    </div>
                  </a>
                );
              })
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2 overflow-hidden">
          {activeThread ? (
            <MessagingUI
              threadId={activeThread.id}
              initialMessages={activeThread.messages as MessageWithSender[]}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

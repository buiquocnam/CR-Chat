"use client";

import { useEffect, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMessages } from "@/features/message/hooks/useMessage";
import { useMarkMessageAsSeen } from "@/features/message/hooks/useMarkMessageAsSeen";
import { useAuthStore } from "@/stores/useAuthStore";
import MessageItem from "./MessageItem";
import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { smartFormat, isTimeGapLarge } from "@/lib";
import { useChatScroll } from "@/features/message/hooks/useChatScroll";
import { useConversationById } from "@/features/chat/hooks/useConversations";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";

interface ChatWindowBodyProps {
  conversationId?: string;
}

export default function ChatWindowBody({ conversationId }: ChatWindowBodyProps) {
  // 1. Data Fetching
  const { data: conversation } = useConversationById(conversationId || "");
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useMessages(conversationId || "");
  const currentUserId = useAuthStore((s) => s.user?._id);

  // 2. Flatten Messages & Sort Chronologically (Oldest First)
  const allMessages = useMemo(() => {
    const flattened = data?.pages.flatMap((page) => page.data) ?? [];
    // Sort logic to ensure correct order regardless of pagination direction
    return flattened.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [data]);

  // 3. Scroll Logic (Refactored)
  const {
    containerRef,
    messagesEndRef,
    showNewMessageNotification,
    handleScrollToBottom
  } = useChatScroll({
    conversationId: conversationId || "",
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    // lastReadMessageId removed
    currentUserId
  });

  // 4. Virtualizer Logic
  const rowVirtualizer = useVirtualizer({
    count: allMessages.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 120, // Estimated height of a message - increased to reduce scroll jumps
    overscan: 10,
  });

  // 5. Mark Messages as Seen Logic
  const { markAsSeen } = useMarkMessageAsSeen();
  useEffect(() => {
    if (allMessages.length === 0 || !currentUserId || !conversationId) return;

    const lastMessage = allMessages[allMessages.length - 1];

    const lastSenderId = (lastMessage.senderId as any)._id || lastMessage.senderId;

    const myUnreadCount = conversation?.unreadCounts?.[currentUserId] ?? 0;

    if (lastSenderId !== currentUserId && myUnreadCount > 0) {
      markAsSeen(conversationId, lastMessage._id);
    }
  }, [allMessages, currentUserId, conversationId, markAsSeen, conversation]);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Bắt đầu cuộc trò chuyện mới!</p>
      </div>
    );
  }

  // 6. Render States
  if (isLoading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (allMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Chưa có tin nhắn. Bắt đầu cuộc trò chuyện!</p>
      </div>
    );
  }

  // 7. Main Render
  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden p-4 relative"
    >
      {/* Load more indicator */}
      {hasNextPage && isFetchingNextPage && (
        <div className="flex justify-center py-2 absolute top-4 left-0 right-0 bg-background/80 backdrop-blur-sm z-10">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Virtualized Message List */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const index = virtualRow.index;
          const message = allMessages[index];
          const nextMessage = index < allMessages.length - 1 ? allMessages[index + 1] : null;
          const previousMessage = index > 0 ? allMessages[index - 1] : null;

          // Handle both populated User object and raw ID string
          const senderIdFromMessage = typeof message.senderId === 'string'
            ? message.senderId
            : (message.senderId as User)._id;

          // Robust comparison converting to string to avoid ObjectId vs string mismatches
          const isSender = String(senderIdFromMessage) === String(currentUserId);

          const nextSenderId = nextMessage
            ? (typeof nextMessage.senderId === 'string' ? nextMessage.senderId : (nextMessage.senderId as User)._id)
            : null;

          const prevSenderId = previousMessage
            ? (typeof previousMessage.senderId === 'string' ? previousMessage.senderId : (previousMessage.senderId as User)._id)
            : null;

          const showAvatar = !nextMessage || nextSenderId !== senderIdFromMessage;
          const isShowName = !previousMessage || prevSenderId !== senderIdFromMessage;
          const showTimeDivider = !previousMessage || isTimeGapLarge(previousMessage.createdAt, message.createdAt);

          return (
            <div
              key={message._id}
              ref={rowVirtualizer.measureElement}
              data-index={index}
              className="absolute top-0 left-0 w-full flex flex-col"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {showTimeDivider && (
                <div className="flex justify-center my-4">
                  <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                    {smartFormat(message.createdAt)}
                  </span>
                </div>
              )}

              <div id={`message-${message._id}`} className={cn("py-1 flex flex-col", isSender ? "items-end" : "items-start")}>
                <MessageItem
                  isShowName={isShowName}
                  message={message}
                  showAvatar={showAvatar}
                  showTime={true}
                  isSender={isSender}
                  // Only show seenBy for the last message if available in conversation
                  seenBy={String(message._id) === String(conversation?.lastMessage?._id) ? conversation?.seenBy : undefined}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll Anchor */}
      < div ref={messagesEndRef} className="h-1" />

      {/* New Message Notification Button */}
      {
        showNewMessageNotification && (
          <div className="sticky bottom-4 flex justify-center z-20">
            <Button
              onClick={handleScrollToBottom}
              size="sm"
              className="rounded-full shadow-lg"
              variant="default"
            >
              <ChevronDown className="h-4 w-4 mr-2" />
              Có tin nhắn mới
            </Button>
          </div>
        )
      }
    </div >
  );
}


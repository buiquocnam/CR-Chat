"use client";

import { useEffect, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMessages } from "@/hooks/message/useMessage";
import { useMarkMessageAsSeen } from "@/hooks/message/useMarkMessageAsSeen";
import { useAuthStore } from "@/stores/useAuthStore";
import MessageItem from "./MessageItem";
import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { smartFormat, isTimeGapLarge } from "@/lib";
import { useChatScroll } from "@/hooks/message/useChatScroll";
import { useConversationById } from "@/hooks/chat/useConversations";

interface ChatWindowBodyProps {
  conversationId: string;
}

export default function ChatWindowBody({ conversationId }: ChatWindowBodyProps) {
  // 1. Data Fetching
  const { data: conversation } = useConversationById(conversationId);
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useMessages(conversationId);
  const currentUserId = useAuthStore((s) => s.user?._id);

  // 2. Flatten Messages (Order: Newest First from API, we want Oldest First for list)
  const allMessages = useMemo(() =>
    data?.pages.flatMap((page) => page.data).reverse() ?? []
    , [data]);

  // 3. Scroll Logic (Refactored)
  const {
    containerRef,
    messagesEndRef,
    showNewMessageNotification,
    handleScrollToBottom
  } = useChatScroll({
    conversationId,
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    lastReadMessageId: conversation?.lastReadMessageId,
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
    if (allMessages.length === 0 || !currentUserId) return;

    const lastMessage = allMessages[allMessages.length - 1];
    if (lastMessage.senderId._id !== currentUserId) {
      // Defer to avoid "flushSync" or state update during render/mount cycle
      const timer = setTimeout(() => {
        markAsSeen(conversationId, lastMessage._id);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [allMessages, currentUserId, conversationId, markAsSeen]);

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
        <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
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

          const isSender = message.senderId._id === currentUserId;
          const showAvatar = !nextMessage || nextMessage.senderId._id !== message.senderId._id;
          const isShowName = !previousMessage || previousMessage.senderId._id !== message.senderId._id;
          const showTimeDivider = !previousMessage || isTimeGapLarge(previousMessage.createdAt, message.createdAt);

          // Logic for unread divider
          const isFirstUnread = conversation?.lastReadMessageId &&
            message._id > conversation.lastReadMessageId &&
            (!previousMessage || previousMessage._id <= conversation.lastReadMessageId) &&
            !isSender;

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

              {isFirstUnread && (
                <div className="flex items-center gap-2 my-4 px-4">
                  <div className="h-[1px] flex-1 bg-red-500/50"></div>
                  <span className="text-xs font-semibold text-red-500">Tin nhắn mới</span>
                  <div className="h-[1px] flex-1 bg-red-500/50"></div>
                </div>
              )}

              <div id={`message-${message._id}`} className="py-1">
                <MessageItem
                  isShowName={isShowName}
                  message={message}
                  showAvatar={showAvatar}
                  showTime={true}
                  isSender={isSender}
                  seenBy={message.seenBy}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll Anchor */}
      <div ref={messagesEndRef} className="h-1" />

      {/* New Message Notification Button */}
      {showNewMessageNotification && (
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
      )}
    </div>
  );
}


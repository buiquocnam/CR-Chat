"use client";

import { memo } from "react";
import { Conversation } from "@/types/conversation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { smartFormat } from "@/lib";
import { User } from "@/types/user";
import { cn } from "@/lib/utils";

interface ChatItemProps {
  currentUser: User | null;
  conversation: Conversation;
  onClick: (id: string) => void;
}

const ChatItem = memo(({ currentUser, conversation, onClick }: ChatItemProps) => {
  // Helper logic to find the other participant in direct chats
  const otherParticipant = conversation.participants.find(p => p._id !== currentUser?._id) || conversation.participants[0];

  const displayName = conversation.type === "group"
    ? conversation.group?.name || "Nhóm chat"
    : otherParticipant?.displayName || "Không xác định";

  const displayAvatar = conversation.type === "group"
    ? undefined // Group avatar logic if needed
    : otherParticipant?.avatarUrl;

  const lastMessage = conversation.lastMessage;
  const unreadCount = (currentUser && conversation.unreadCounts?.[currentUser._id]) || 0;
  const senderName =
    lastMessage?.senderId?._id === currentUser?._id
      ? "Tôi"
      : lastMessage?.senderId?.username || "";

  let lastMessageContent = "Chưa có tin nhắn";

  if (lastMessage) {
    if (lastMessage.imgUrl) lastMessageContent = 'Đã gửi một ảnh';
    else if (/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(lastMessage.content)) lastMessageContent = 'Đã gửi một ảnh';
    else if (lastMessage.content.startsWith("http")) lastMessageContent = 'Đã gửi một tệp đính kèm';
    else lastMessageContent = lastMessage.content;
  }

  const isUnread = unreadCount > 0;

  return (
    <div
      className={cn(
        "group relative flex flex-row gap-3 p-3 mx-1 rounded-2xl cursor-pointer transition-all duration-200 border border-transparent",
        isUnread
          ? 'bg-card shadow-sm ring-1 ring-border'
          : 'hover:bg-muted/50 hover:shadow-sm hover:border-border'
      )}
      onClick={() => onClick(conversation._id)}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden relative flex-shrink-0 shadow-sm ring-2 ring-white">
        {displayAvatar ? (
          <Image
            src={displayAvatar}
            alt={displayName}
            fill
            unoptimized
            priority
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 text-primary/70">
            <span className="text-lg font-bold">
              {displayName[0]?.toUpperCase() || "?"}
            </span>
          </div>
        )}
        {/* Online Indicator (Hypothetical - assuming conversation object might have it later or we just style the avatar nicely) */}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className={`text-sm truncate ${isUnread ? 'font-bold text-foreground' : 'font-medium text-foreground/90'}`}>
              {displayName}
            </h3>
            {conversation.type === "group" && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0 bg-secondary text-secondary-foreground hover:bg-secondary">
                Nhóm
              </Badge>
            )}
          </div>
          {lastMessage && (
            <span className={`text-[10px] ${isUnread ? 'text-primary font-bold' : 'text-muted-foreground/60'}`}>
              {smartFormat(lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between min-w-0">
          <p className={`text-xs truncate flex-1 ${isUnread ? 'text-foreground font-medium' : 'text-muted-foreground/80'}`}>
            {lastMessage ? (
              <span className="flex items-center gap-1">
                {senderName === "Tôi" && <span className="text-xs opacity-70">Bạn:</span>}
                {senderName !== "Tôi" && conversation.type === "group" && <span className="text-xs opacity-70">{senderName}:</span>}
                {lastMessageContent}
              </span>
            ) : (
              lastMessageContent
            )}
          </p>

          {isUnread && (
            <Badge className="h-5 min-w-5 px-1.5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full shadow-sm shadow-primary/20">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
});

ChatItem.displayName = "ChatItem";

export default ChatItem;

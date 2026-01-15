"use client";

import { memo } from "react";
import { Conversation } from "@/types/conversation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { smartFormat } from "@/lib";
import { User } from "@/types/user";

interface ChatItemProps {
  currentUser: User | null;
  conversation: Conversation;
  onClick: (id: string) => void;
}

const ChatItem = memo(({ currentUser, conversation, onClick }: ChatItemProps) => {
  const displayName =
    conversation.type === "group"
      ? conversation.name || "Group Chat"
      : conversation.otherMember?.username || "Unknown";

  const displayAvatar =
    conversation.type === "group"
      ? conversation.avatar
      : conversation.otherMember?.avatar;

  const lastMessage = conversation.lastMessage;
  const unreadCount = conversation.unreadCount || 0;
  const senderName =
    lastMessage?.senderId?._id === currentUser?._id
      ? "Me"
      : lastMessage?.senderId?.username || "";

  let lastMessageContent = "No messages yet";

  if (lastMessage) {
    if (lastMessage.type === 'image') lastMessageContent = 'Sent an image';
    else if (lastMessage.type === 'file') lastMessageContent = 'Sent a file';
    else lastMessageContent = lastMessage.content;
  }

  const isUnread = unreadCount > 0;

  return (
    <Card
      className={`flex flex-row gap-3 p-4 w-full overflow-hidden cursor-pointer hover:bg-accent transition-colors ${isUnread ? 'bg-accent/50' : ''}`}
      onClick={() => onClick(conversation._id)}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden bg-primary relative flex-shrink-0">
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
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            <span className="text-lg font-bold">
              {displayName[0]?.toUpperCase() || "?"}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className={`text-sm truncate ${isUnread ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>
              {displayName}
            </h3>
            {conversation.type === "group" && (
              <Badge variant="outline" className="text-[10px] h-5 px-1 py-0 border-muted-foreground/30 text-muted-foreground">
                Group
              </Badge>
            )}
          </div>
          {lastMessage && (
            <span className={`text-xs ${isUnread ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
              {smartFormat(lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between min-w-0">
          <p className={`text-xs truncate flex-1 ${isUnread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            {lastMessage ? `${senderName}: ${lastMessageContent}` : lastMessageContent}
          </p>

          {isUnread && (
            <Badge className="h-5 min-w-5 px-1.5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
});

ChatItem.displayName = "ChatItem";

export default ChatItem;

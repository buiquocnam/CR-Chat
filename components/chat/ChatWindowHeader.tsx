"use client";

import { Conversation } from "@/types/conversation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import { AddMembersDialog } from "@/components/chat/AddMembersDialog";
import { ConversationMembersDialog } from "@/components/chat/ConversationMembersDialog";

interface ChatWindowHeaderProps {
  conversation: Conversation;
}

export default function ChatWindowHeader({ conversation }: ChatWindowHeaderProps) {
  const router = useRouter();

  const displayName = conversation.type === "group"
    ? conversation.name || "Group Chat"
    : conversation.createdBy?.username || "Unknown";

  const displayAvatar = conversation.type === "group"
    ? conversation.avatar
    : conversation.createdBy?.avatar;

  return (
    <div className="flex items-center gap-3 p-4 border-b bg-background">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="md:hidden"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="w-10 h-10 rounded-full overflow-hidden bg-muted relative flex-shrink-0">
        {displayAvatar ? (
          <Image
            src={displayAvatar}
            alt={displayName}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-lg font-bold">
              {displayName[0]?.toUpperCase() || "?"}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="font-semibold truncate">{displayName}</h2>
        {conversation.type === "group" && (
          <p className="text-sm text-muted-foreground truncate">
            Group conversation
          </p>
        )}
      </div>

      {conversation.type === "group" && (
        <>
          <ConversationMembersDialog conversationId={conversation._id} />
          <AddMembersDialog conversationId={conversation._id} />
        </>
      )}
    </div>
  );
}


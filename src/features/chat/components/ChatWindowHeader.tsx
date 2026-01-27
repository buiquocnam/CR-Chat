"use client";

import { Conversation } from "@/types/conversation";
import { User } from "@/types/user";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";


import { ConversationMembersDialog } from "@/features/chat/components/ConversationMembersDialog";

import { useAuthStore } from "@/stores/useAuthStore";

interface ChatWindowHeaderProps {
  conversation?: Conversation;
  otherUser?: User; // Fallback if no conversation
}

export default function ChatWindowHeader({ conversation, otherUser }: ChatWindowHeaderProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const otherParticipant = conversation
    ? (conversation.participants?.find(p => p._id !== user?._id) || conversation.participants?.[0])
    : otherUser; // Map User to participant-like structure if needed, or just use User properties directly

  // Helper to get display info
  const getDisplayInfo = () => {
    if (conversation) {
      if (conversation.type === "group") {
        return {
          name: conversation.group?.name || "Nhóm chat",
          avatar: undefined,
          isGroup: true,
          membersCount: conversation.participants?.length || 0
        };
      } else {
        const p = conversation.participants?.find(p => p._id !== user?._id) || conversation.participants?.[0];
        return {
          name: p?.displayName || "Unknown",
          avatar: p?.avatarUrl,
          isGroup: false
        };
      }
    } else if (otherUser) {
      return {
        name: otherUser.displayName || otherUser.username || "Không xác định",
        avatar: otherUser.avatarUrl,
        isGroup: false
      };
    }
    return { name: "Đang tải...", isGroup: false };
  };

  const { name, avatar, isGroup, membersCount } = getDisplayInfo();

  return (
    <div className="flex items-center gap-5 p-4 md:px-6 md:py-5 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="md:hidden text-white/70 hover:bg-white/10 hover:text-white rounded-xl"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      <div className="w-12 h-12 rounded-[18px] relative shrink-0 shadow-lg shadow-black/5 flex items-center justify-center bg-white/20 ring-1 ring-white/30 overflow-hidden">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/40 to-white/10 text-foreground/80 font-bold text-lg backdrop-blur-md">
            {name[0]?.toUpperCase() || "?"}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <h2 className="font-bold text-lg text-foreground/90 tracking-normal truncate drop-shadow-sm">{name}</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/80 font-medium tracking-wide">
          {isGroup ? (
            <span className="flex items-center gap-2">
              Nhóm <span className="w-1 h-1 rounded-full bg-current opacity-40" /> {membersCount} thành viên
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_2px_rgba(16,185,129,0.3)]" />
              Đang hoạt động
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isGroup && conversation && (
          <>
            <ConversationMembersDialog conversationId={conversation._id} />
          </>
        )}
      </div>
    </div>
  );
}


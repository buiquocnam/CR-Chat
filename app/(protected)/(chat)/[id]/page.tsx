"use client";

import { useParams } from "next/navigation";
import { useConversationById } from "@/features/chat/hooks/useConversations";
import ChatWindowLayout from "@/features/chat/components/ChatWindowLayout";
import ChatWindowHeader from "@/features/chat/components/ChatWindowHeader";
import ChatWindowBody from "@/features/message/components/ChatWindowBody";
import ChatWindowInput from "@/features/message/components/ChatWindowInput";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: conversation, isLoading } = useConversationById(id);
  const user = useAuthStore((state) => state.user);

  if (isLoading) {
    return (
      <ChatWindowLayout>
        <div className="flex-1 flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </ChatWindowLayout>
    );
  }

  if (conversation) {
    let receiverId = undefined;
    if (conversation.type === 'direct') {
      const otherMember = conversation.participants.find((p) => p._id !== user?._id);
      receiverId = otherMember?._id;
    }

    return (
      <ChatWindowLayout>
        <ChatWindowHeader conversation={conversation} />
        <ChatWindowBody conversationId={conversation._id} />
        <ChatWindowInput
          conversationId={conversation._id}
          receiverId={receiverId}
        />
      </ChatWindowLayout>
    );
  }

  return (
    <ChatWindowLayout>
      <div className="flex-1 flex items-center justify-center h-full">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    </ChatWindowLayout>
  );
}

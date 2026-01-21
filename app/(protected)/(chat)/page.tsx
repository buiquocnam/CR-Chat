"use client";

import { ChatSidebar } from "@/features/chat/components/ChatSidebar";
import { MessageCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useUserById } from "@/features/user/hooks/useUserById";
import ChatWindowLayout from "@/features/chat/components/ChatWindowLayout";
import ChatWindowHeader from "@/features/chat/components/ChatWindowHeader";
import ChatWindowInput from "@/features/message/components/ChatWindowInput";

export default function Home() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const { data: user, isLoading } = useUserById(userId || "");

  if (userId) {
    if (isLoading) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (user) {
      return (
        <ChatWindowLayout>
          <ChatWindowHeader otherUser={user} />
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <p>Start a conversation with {user.displayName || user.username}</p>
          </div>
          <ChatWindowInput receiverId={user._id} />
        </ChatWindowLayout>
      );
    }
  }

  return (
    <div className="h-full w-full">
      {/* Mobile: Show Chat Sidebar */}
      <div className="md:hidden h-full">
        <ChatSidebar />
      </div>

      {/* Desktop: Show Welcome / Empty State */}
      <div className="hidden md:flex flex-col h-full items-center justify-center text-muted-foreground p-8 text-center bg-white/30 backdrop-blur-3xl">
        <div className="w-24 h-24 bg-gradient-to-tr from-indigo-50 to-purple-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white">
          <MessageCircle className="w-10 h-10 text-primary/80" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Welcome to Moji</h2>
        <p className="max-w-md text-muted-foreground/80 text-lg">Select a conversation from the sidebar or start a new one to begin messaging.</p>
      </div>
    </div>
  );
}
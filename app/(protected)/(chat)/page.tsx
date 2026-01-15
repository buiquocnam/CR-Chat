"use client";

import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="h-full w-full">
      {/* Mobile: Show Chat Sidebar */}
      <div className="md:hidden h-full">
        <ChatSidebar />
      </div>

      {/* Desktop: Show Welcome / Empty State */}
      <div className="hidden md:flex flex-col h-full items-center justify-center text-muted-foreground p-8 text-center bg-muted/5">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <MessageCircle className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Moji</h2>
        <p className="max-w-md">Select a conversation from the sidebar or start a new one to begin messaging.</p>
      </div>
    </div>
  );
}
"use client";

import { ChatSidebar } from "@/features/chat/components/ChatSidebar";
import { MessageCircle } from "lucide-react";

export default function Home() {
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
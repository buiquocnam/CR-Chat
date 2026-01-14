"use client";

import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useSocket } from "@/hooks/shared/useSocket";
import { useFriendSocket } from "@/hooks/friend/useFriendSocket";
import { useChatSocket } from "@/hooks/chat/useChatSocket";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useSocket();
  useFriendSocket();
  useChatSocket();
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 min-w-0 overflow-hidden">
        {children}
      </main>
    </SidebarProvider>
  );
}

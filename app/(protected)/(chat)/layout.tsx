"use client";

import { ChatSidebar } from "@/components/chat/ChatSidebar";

export default function ChatLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-full w-full overflow-hidden">
            <div className="hidden md:flex h-full w-[380px] lg:w-[420px] flex-shrink-0 border-r bg-background">
                <ChatSidebar />
            </div>
            <main className="flex-1 min-w-0 h-full overflow-hidden bg-background">
                {children}
            </main>
        </div>
    );
}

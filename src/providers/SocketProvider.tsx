"use client";

import { useSocket } from "@/hooks/useSocket";
import { useFriendSocket } from "@/features/friend/hooks/useFriendSocket";
import { useChatSocket } from "@/features/chat/hooks/useChatSocket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
    useSocket();
    useFriendSocket();
    useChatSocket();
    return <>{children}</>;
}

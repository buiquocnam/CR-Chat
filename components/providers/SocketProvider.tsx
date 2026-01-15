"use client";

import { useSocket } from "@/hooks/shared/useSocket";
import { useFriendSocket } from "@/hooks/friend/useFriendSocket";
import { useChatSocket } from "@/hooks/chat/useChatSocket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
    useSocket();
    useFriendSocket();
    useChatSocket();
    return <>{children}</>;
}

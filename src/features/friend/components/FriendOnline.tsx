"use client";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useOnlineFriends } from "@/features/friend/hooks/useOnlineFriends";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User } from "@/types/user";
import { conversationService } from "@/features/chat/services/conversationService";
import { useAuthStore } from "@/stores/useAuthStore";

export default function FriendOnline() {
  const { data, isLoading } = useOnlineFriends();
  const router = useRouter();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  // Flatten all pages to get all online friends
  const { user: currentUser } = useAuthStore();
  const onlineUsersData = data?.pages.flatMap((page) => page.data) ?? [];
  const onlineUsers = onlineUsersData.filter(user => user._id !== currentUser?._id);
  const onlineCount = onlineUsers.length;

  const handleFriendClick = async (friend: User) => {
    if (loadingUserId) return;

    setLoadingUserId(friend._id);
    try {
      const { conversation } = await conversationService.getDirectConversation(friend._id);
      if (conversation) {
        router.push(`/${conversation._id}`);
      } else {
        router.push(`/?userId=${friend._id}`);
      }
    } catch (error) {
      console.error("Failed to open conversation:", error);
      router.push(`/?userId=${friend._id}`);
    } finally {
      setLoadingUserId(null);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Friends Online</h2>
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Loading...
          </Badge>
        </div>
      </div>
    );
  }

  if (onlineCount === 0) {
    return (
      <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Friends Online</h2>
          <Badge variant="secondary">0 online</Badge>
        </div>
        <p className="text-sm text-muted-foreground">No friends online</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Friends Online</h2>
        <Badge variant="default">{onlineCount} online</Badge>
      </div>

      <div className="flex gap-4 flex-wrap">
        {onlineUsers.map((user) => {
          const isLoading = loadingUserId === user._id;

          return (
            <div
              key={user._id}
              className="flex flex-col items-center cursor-pointer group transition-opacity"
              onClick={() => handleFriendClick(user)}
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center relative group-hover:ring-2 group-hover:ring-primary transition-all">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.displayName || user.username}
                      width={64}
                      height={64}
                      priority
                      unoptimized
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-semibold text-lg">
                      {(user.displayName || user.username)?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                </div>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-center text-sm font-medium max-w-[64px] truncate">
                {user.displayName || user.username}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}


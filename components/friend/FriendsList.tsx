"use client";

import Image from "next/image";
import { useFriends } from "@/hooks/friend/useFriends";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { conversationService } from "@/services/conversationService";
import { useState } from "react";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";

export default function FriendsList({ active }: { active: boolean }) {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useFriends(active);
  const router = useRouter();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  if (!active) {
    return null;
  }

  const friends: User[] = data?.pages.flatMap((page) => page.data) ?? [];

  const handleFriendClick = async (friend: User) => {
    if (loadingUserId) return;
    
    setLoadingUserId(friend._id);
    try {
      const conversation = await conversationService.createPrivateConversation(friend._id);
      router.push(`/${conversation._id}`);
    } catch (error) {
      console.error("Failed to open conversation:", error);
    } finally {
      setLoadingUserId(null);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No friends yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {friends.map((friend) => {
        const isLoading = loadingUserId === friend._id;

        return (
          <div
            key={friend._id}
            className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => handleFriendClick(friend)}
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {friend.avatar ? (
                <Image
                  src={friend.avatar}
                  alt={friend.username}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-semibold">
                  {friend.username?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              {friend.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{friend.username}</p>
              {friend.email && (
                <p className="text-sm text-muted-foreground truncate">{friend.email}</p>
              )}
              {friend.isOnline ? (
                <p className="text-xs text-green-500">Online</p>
              ) : friend.lastSeen ? (
                <p className="text-xs text-muted-foreground">
                  Last seen {new Date(friend.lastSeen).toLocaleDateString()}
                </p>
              ) : null}
            </div>

            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        );
      })}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}


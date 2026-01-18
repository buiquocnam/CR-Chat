"use client";

import { useFriends } from "@/features/friend/hooks/useFriends";
import { Loader2, MessageSquare, MoreVertical, UserX } from "lucide-react";
import { useRouter } from "next/navigation";
import { conversationService } from "@/features/chat/services/conversationService";
import { useState } from "react";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnfriend } from "@/features/friend/hooks/useUnfriend";
import { UserItem } from "@/components/shared/UserItem";

export default function FriendsList({ active }: { active: boolean }) {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useFriends(active);
  const router = useRouter();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const { mutate: unfriend } = useUnfriend();

  if (!active) {
    return null;
  }

  const friends: User[] = data?.pages.flatMap((page) => page.data) ?? [];

  const handleChat = async (friendId: string) => {
    if (loadingUserId) return;

    setLoadingUserId(friendId);
    try {
      const conversation = await conversationService.createPrivateConversation(friendId);
      router.push(`/${conversation._id}`);
    } catch (error) {
      console.error("Failed to open conversation:", error);
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleUnfriend = (e: React.MouseEvent, friendId: string) => {
    e.stopPropagation(); // Prevent navigation
    if (confirm("Are you sure you want to unfriend this user?")) {
      unfriend(friendId);
    }
  }

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

        const renderSubText = () => {
          if (friend.isOnline) return <span className="text-xs text-green-500 font-medium">Online</span>;
          if (friend.lastSeen) return <span className="text-xs text-muted-foreground">Last seen {new Date(friend.lastSeen).toLocaleDateString()}</span>;
          return null;
        }

        const renderActions = () => {
          if (isLoading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
          return (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); handleChat(friend._id); }}>
                <MessageSquare className="w-4 h-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={(e) => handleUnfriend(e, friend._id)}>
                    <UserX className="w-4 h-4 mr-2" />
                    Unfriend
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )
        }

        return (
          <UserItem
            key={friend._id}
            user={friend}
            subText={renderSubText()}
            actions={renderActions()}
            onClick={() => handleChat(friend._id)}
            className="border bg-card shadow-sm"
          />
        );
      })}

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-full"
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

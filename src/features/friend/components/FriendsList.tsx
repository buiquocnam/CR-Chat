"use client";

import { useFriends } from "@/features/friend/hooks/useFriends";
import { Loader2, MessageSquare, MoreVertical, UserX } from "lucide-react";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { UserItem } from "@/components/shared/UserItem";
import { useState } from "react";
import UserProfileDialog from "@/features/user/components/UserProfileDialog";
import { useRouter } from "next/navigation";
import { conversationService } from "@/features/chat/services/conversationService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnfriend } from "@/features/friend/hooks/useUnfriend";

export default function FriendsList({ active }: { active: boolean }) {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useFriends(active);
  const router = useRouter();
  const { mutate: unfriend } = useUnfriend();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openUserProfileDialog, setOpenUserProfileDialog] = useState(false);

  const handleOpenUserProfileDialog = (user: User) => {
    setSelectedUser(user);
    setOpenUserProfileDialog(true);
  };

  const handleChat = async (friendId: string) => {
    try {
      const { conversation } = await conversationService.getDirectConversation(friendId);
      if (conversation) {
        router.push(`/${conversation._id}`);
      } else {
        router.push(`/?userId=${friendId}`);
      }
    } catch (error) {
      router.push(`/?userId=${friendId}`);
    }
  };

  const handleUnfriend = (e: React.MouseEvent, friendId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to unfriend this user?")) {
      unfriend(friendId);
    }
  };

  if (!active) {
    return null;
  }

  const friends: User[] = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading && friends.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Chưa có bạn bè nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {friends.map((friend) => (
        <UserItem
          key={friend._id}
          user={friend}
          subText={
            friend.isOnline ? (
              <span className="text-xs text-green-500 font-medium">Online</span>
            ) : friend.lastSeen ? (
              <span className="text-xs text-muted-foreground">Online {new Date(friend.lastSeen).toLocaleDateString('vi-VN')}</span>
            ) : null
          }
          onClick={() => handleOpenUserProfileDialog(friend)}
          actions={
            <div className="flex items-center gap-1">
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
                    Hủy kết bạn
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
          className="border bg-card shadow-sm hover:bg-muted/50 transition-colors"
        />
      ))}

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
                Đang tải...
              </>
            ) : (
              "Xem thêm"
            )}
          </Button>
        </div>
      )}
      <UserProfileDialog open={openUserProfileDialog} onOpenChange={setOpenUserProfileDialog} user={selectedUser} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchUsers } from "@/features/user/hooks/useSearchUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader2, UserPlus, Search, Check, Clock, X, UserMinus } from "lucide-react";
import { UserProfileDialog } from "@/features/user/components";
import { UserItem } from "@/components/shared/UserItem";
import { useSendFriendRequest, useCancelFriendRequest, useUnfriend } from "@/features/friend/hooks";

interface SearchUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchUserDialog({ open, onOpenChange }: SearchUserDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { data, isLoading } = useSearchUsers(debouncedSearch);
  const [openUserProfileDialog, setOpenUserProfileDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const handleOpenUserProfileDialog = (user: any) => {
    setSelectedUser(user);
    setOpenUserProfileDialog(true);
  };

  const users = data?.pages.flatMap((page) => page?.data ?? []) ?? [];

  const sendRequestMutation = useSendFriendRequest();
  const cancelRequestMutation = useCancelFriendRequest();
  const unfriendMutation = useUnfriend();

  const handleSendRequest = (userId: string) => {
    setPendingUserId(userId);
    sendRequestMutation.mutate(userId, {
      onSettled: () => {
        setPendingUserId(null);
      }
    });
  };

  const handleCancelRequest = (requestId: string, userId: string) => {
    setPendingUserId(userId);
    cancelRequestMutation.mutate({ requestId, userId }, {
      onSettled: () => {
        setPendingUserId(null);
      }
    });
  };

  const handleUnfriend = (friendId: string) => {
    setPendingUserId(friendId);
    unfriendMutation.mutate(friendId, {
      onSettled: () => {
        setPendingUserId(null);
      }
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>Tìm kiếm bạn bè</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nhập tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="mt-4 min-h-[200px] max-h-[400px] overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length > 0 ? (
              users.map(user => (
                <UserItem
                  key={user._id}
                  user={user}
                  onClick={() => handleOpenUserProfileDialog(user)}
                  className="border"
                  actions={
                    user.relationship === 'friend' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnfriend(user._id);
                        }}
                        disabled={pendingUserId === user._id}
                        className="min-w-[100px] h-8 text-[11px] rounded-full"
                      >
                        {pendingUserId === user._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><UserMinus className="h-3 w-3 mr-1.5" /> Hủy kết bạn</>}
                      </Button>
                    ) : user.relationship === 'request_sent' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          user.friendRequestId && handleCancelRequest(user.friendRequestId, user._id);
                        }}
                        disabled={pendingUserId === user._id}
                        className="min-w-[100px] h-8 text-[11px] rounded-full"
                      >
                        {pendingUserId === user._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><X className="h-3 w-3 mr-1.5" /> Hủy</>}
                      </Button>
                    ) : user.relationship === 'request_received' ? (
                      <Button size="sm" variant="secondary" disabled className="min-w-[100px] h-8 text-[11px] rounded-full opacity-60">
                        <Clock className="h-3 w-3 mr-1.5" />
                        Chờ duyệt
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendRequest(user._id);
                        }}
                        disabled={pendingUserId === user._id}
                        className="min-w-[100px] h-8 text-[11px] rounded-full"
                      >
                        {pendingUserId === user._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><UserPlus className="h-3 w-3 mr-1.5" /> Kết bạn</>}
                      </Button>
                    )
                  }
                />
              ))
            ) : debouncedSearch ? (
              <p className="text-center text-muted-foreground py-4">Không tìm thấy người dùng nào.</p>
            ) : (
              <p className="text-center text-muted-foreground py-4">Nhập từ khóa để tìm kiếm.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <UserProfileDialog open={openUserProfileDialog} onOpenChange={setOpenUserProfileDialog} user={selectedUser} />
    </>
  );
}

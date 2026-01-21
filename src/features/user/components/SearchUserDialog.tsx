"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchUsers } from "@/features/user/hooks/useSearchUsers";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader2, UserPlus, Search, Check, Clock, X, UserMinus } from "lucide-react";
import Image from "next/image";
import { UserProfileDialog } from "@/features/user/components";
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
                <div key={user._id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  onClick={() => handleOpenUserProfileDialog(user)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted cursor-pointer" >
                      {user.avatarUrl ? (
                        <Image src={user.avatarUrl} alt={user.displayName} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-sm font-bold">
                          {(user.displayName || user.username)?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.displayName || user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  {user.relationship === 'friend' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnfriend(user._id);
                      }}
                      disabled={pendingUserId === user._id}
                      className="min-w-[100px]"
                    >
                      {pendingUserId === user._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserMinus className="h-4 w-4 mr-2" /> Hủy kết bạn</>}
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
                      className="min-w-[100px]"
                    >
                      {pendingUserId === user._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><X className="h-4 w-4 mr-2" /> Hủy</>}
                    </Button>
                  ) : user.relationship === 'request_received' ? (
                    <Button size="sm" variant="secondary" disabled className="min-w-[100px]">
                      <Clock className="h-4 w-4 mr-2" />
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
                      className="min-w-[100px]"
                    >
                      {pendingUserId === user._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4 mr-2" /> Kết bạn</>}
                    </Button>
                  )}
                </div>
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

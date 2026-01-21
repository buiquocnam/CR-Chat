"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MessageSquare, UserPlus, Clock, X, Loader2, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSendFriendRequest, useCancelFriendRequest, useUnfriend } from "@/features/friend/hooks";
import { useState } from "react";
import { useSocketStore } from "@/stores/useSocketStore";

interface UserProfileDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserProfileDialog({ user, open, onOpenChange }: UserProfileDialogProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const emitAsync = useSocketStore((state) => state.emitAsync);

  const sendRequestMutation = useSendFriendRequest();
  const cancelRequestMutation = useCancelFriendRequest();
  const unfriendMutation = useUnfriend();

  const handleSendRequest = () => {
    if (!user) return;
    setIsPending(true);
    sendRequestMutation.mutate(user._id, {
      onSettled: () => setIsPending(false)
    });
  };

  const handleCancelRequest = () => {
    if (!user?.friendRequestId) return;
    setIsPending(true);
    cancelRequestMutation.mutate({
      requestId: user.friendRequestId,
      userId: user._id
    }, {
      onSettled: () => setIsPending(false)
    });
  };

  const handleUnfriend = () => {
    if (!user) return;
    setIsPending(true);
    unfriendMutation.mutate(user._id, {
      onSettled: () => setIsPending(false)
    });
  };

  const handleMessage = async () => {
    if (!user) return;
    try {
      setIsPending(true);
      // Find existing conversation or create new via socket
      const conversation = await emitAsync("create_conversation", {
        type: 'direct',
        memberIds: [user._id]
      });
      router.push(`/${conversation._id}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Handle message error:", error);
      toast.error("Không thể tạo cuộc trò chuyện");
    } finally {
      setIsPending(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Thông tin người dùng</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.displayName} fill className="object-cover" />
            ) : (
              <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.displayName} fill className="object-cover" />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            {user.bio && <p className="text-sm mt-2 font-medium">{user.bio}</p>}

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground w-full bg-muted/50 p-3 rounded-lg">
              <div className="flex flex-col gap-1 items-center">
                <span className="font-semibold text-foreground">Email</span>
                <span className="truncate max-w-full" title={user.email}>{user.email}</span>
              </div>
              <div className="flex flex-col gap-1 items-center border-l border-border pl-2">
                <span className="font-semibold text-foreground">Tham gia</span>
                <span>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              {user.phone && (
                <div className="flex flex-col gap-1 items-center col-span-2 border-t border-border mt-2 pt-2">
                  <span className="font-semibold text-foreground">Điện thoại</span>
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 w-full mt-4">
            <Button className="flex-1" onClick={handleMessage}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Nhắn tin
            </Button>

            {user.relationship === 'friend' ? (
              <Button className="flex-1" variant="outline" onClick={handleUnfriend} disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserMinus className="w-4 h-4 mr-2" /> Hủy kết bạn</>}
              </Button>
            ) : user.relationship === 'request_sent' ? (
              <Button className="flex-1" variant="outline" onClick={handleCancelRequest} disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-2" /> Hủy</>}
              </Button>
            ) : user.relationship === 'request_received' ? (
              <Button className="flex-1" variant="secondary" disabled>
                <Clock className="w-4 h-4 mr-2" /> Chờ duyệt
              </Button>
            ) : (
              <Button
                className="flex-1"
                variant="secondary"
                onClick={handleSendRequest}
                disabled={isPending}
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4 mr-2" /> Kết bạn</>}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

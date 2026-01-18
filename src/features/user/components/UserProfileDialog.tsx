"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MessageSquare, UserPlus, Check, Clock, X, Loader2, UserMinus } from "lucide-react";
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
    cancelRequestMutation.mutate(user.friendRequestId, {
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
        type: 'private',
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
            {user.avatar ? (
              <Image src={user.avatar} alt={user.username} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-3xl font-bold">
                {user.username?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold">{user.username}</h2>
            <p className="text-muted-foreground">{user.email}</p>
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

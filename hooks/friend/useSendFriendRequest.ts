"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSocketStore } from "@/stores/useSocketStore";
import { FriendCacheService } from "@/services/friendCacheService";
import { useMemo } from "react";

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  const emitAsync = useSocketStore((state) => state.emitAsync);
  const friendCacheService = useMemo(() => new FriendCacheService(queryClient), [queryClient]);

  return useMutation({
    mutationFn: (userId: string) => emitAsync("send_friend_request", { receiverId: userId }),
    onSuccess: () => {
      toast.success("Đã gửi lời mời kết bạn!");
      friendCacheService.handleRequestResponse();
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể gửi lời mời");
    },
  });
};

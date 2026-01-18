"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSocketStore } from "@/stores/useSocketStore";
import { FriendCacheService } from "@/features/friend/services/friendCacheService";
import { useMemo } from "react";

export const useCancelFriendRequest = () => {
  const queryClient = useQueryClient();
  const emitAsync = useSocketStore((state) => state.emitAsync);
  const friendCacheService = useMemo(() => new FriendCacheService(queryClient), [queryClient]);

  return useMutation({
    mutationFn: (requestId: string) => emitAsync("cancel_friend_request", { requestId }),
    onSuccess: () => {
      toast.success("Đã hủy lời mời kết bạn!");
      friendCacheService.handleRequestResponse();
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể hủy lời mời");
    },
  });
};

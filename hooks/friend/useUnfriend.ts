"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSocketStore } from "@/stores/useSocketStore";
import { FriendCacheService } from "@/services/friendCacheService";
import { useMemo } from "react";

export const useUnfriend = () => {
  const queryClient = useQueryClient();
  const emitAsync = useSocketStore((state) => state.emitAsync);
  const friendCacheService = useMemo(() => new FriendCacheService(queryClient), [queryClient]);

  return useMutation({
    mutationFn: (friendId: string) => emitAsync("unfriend", { friendId }),
    onSuccess: () => {
      toast.success("Đã hủy kết bạn!");
      friendCacheService.handleUnfriended();
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể hủy kết bạn");
    },
  });
};

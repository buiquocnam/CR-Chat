"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { friendService } from "@/features/friend/services/friendService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { FriendCacheService } from "@/features/friend/services/friendCacheService";
import { useMemo } from "react";

export const useFriendRequests = (active: boolean) => {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.FRIEND_REQUESTS],
    enabled: !!accessToken && active,
    queryFn: async () => {
      return friendService.getFriendRequests();
    },
  });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  const emitAsync = useSocketStore((state) => state.emitAsync);
  const friendCacheService = useMemo(() => new FriendCacheService(queryClient), [queryClient]);

  return useMutation({
    mutationFn: (requestId: string) => emitAsync("accept_friend_request", { requestId }),
    onSuccess: () => {
      toast.success("Đã chấp nhận lời mời kết bạn!");
      friendCacheService.handleAccepted();
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể chấp nhận lời mời");
    }
  });
};

export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();
  const emitAsync = useSocketStore((state) => state.emitAsync);
  const friendCacheService = useMemo(() => new FriendCacheService(queryClient), [queryClient]);

  return useMutation({
    mutationFn: (requestId: string) => emitAsync("reject_friend_request", { requestId }),
    onSuccess: () => {
      toast.info("Đã từ chối lời mời kết bạn");
      friendCacheService.handleRejected();
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể từ chối lời mời");
    }
  });
};

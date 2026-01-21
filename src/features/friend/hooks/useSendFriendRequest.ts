"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSocketStore } from "@/stores/useSocketStore";
import { FriendCacheService } from "@/features/friend/services/friendCacheService";
import { useMemo } from "react";

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  const emitAsync = useSocketStore((state) => state.emitAsync);
  const friendCacheService = useMemo(() => new FriendCacheService(queryClient), [queryClient]);

  return useMutation({
    mutationFn: (userId: string) => emitAsync("send_friend_request", { receiverId: userId }),
    onSuccess: (data: any, variables: string) => {
      // data is the response from sendRequest. variables is userId (receiverId)
      toast.success("Đã gửi lời mời kết bạn!");
      
      // Manually update the search result to show "Cancel" button immediatey
      friendCacheService.updateSearchUserRelationship(variables, 'request_sent', data.request._id);
      
      // Still invalidate requests list to keep it fresh in background
      friendCacheService.handleRequestResponse();
    },
    onError: (error: any) => {
      // Socket error response might be structured differently, adapting commonly
      toast.error(error.message || "Không thể gửi lời mời");
    },
  });
};

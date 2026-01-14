"use client";

import { useInfiniteQuery, useQuery, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { conversationService } from "@/services/conversationService";
import { useAuthStore } from "@/stores/useAuthStore";
import { Conversation, ConversationResponse } from "@/types/conversation";
import { useEffect } from "react";
import { useSocketStore } from "@/stores/useSocketStore";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useConversations = () => {
  const { accessToken } = useAuthStore();

  return useInfiniteQuery<ConversationResponse>({
    queryKey: [QUERY_KEYS.CONVERSATIONS],
    enabled: !!accessToken,
    initialPageParam: undefined,

    queryFn: async ({ pageParam }) => {
      return conversationService.getConversations({
         cursor: pageParam as string,
         limit: 20,
      } );
    },

    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNext
        ? lastPage.meta.nextCursor || undefined
        : undefined;
    },
  });
};

export const useConversationById = (conversationId: string) => {
  const emitAsync = useSocketStore((state) => state.emitAsync);

  // Join conversation room when opening conversation
  useEffect(() => {
    if (!conversationId) return;

    emitAsync("join_conversation", { conversationId }).catch(console.error);

    return () => {
      emitAsync("leave_conversation", { conversationId }).catch(console.error);
    };
    
  }, [emitAsync, conversationId]);

  return useQuery<Conversation>({
    queryKey: [QUERY_KEYS.CONVERSATIONS, conversationId],
    enabled: !!conversationId,
    queryFn: () => conversationService.getConversationById(conversationId),
  });
};
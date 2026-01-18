"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { conversationService } from "@/features/chat/services/conversationService";
import { useAuthStore } from "@/stores/useAuthStore";
import { CursorPaginationParams } from "@/types/pagination";
import { ConversationResponse } from "@/types/conversation";
import { DEFAULT_CURSOR_PAGINATION } from "@/lib/pagination";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useSearchConversations = (
  query: string,
  params?: CursorPaginationParams
) => {
  const { accessToken } = useAuthStore();

  return useInfiniteQuery<ConversationResponse>({
    queryKey: [QUERY_KEYS.SEARCH_CONVERSATIONS, query, params],
    enabled: !!accessToken && !!query.trim(),
    initialPageParam: undefined,

    queryFn: async ({ pageParam }) => {
      return conversationService.searchConversations(query, {
        ...DEFAULT_CURSOR_PAGINATION,
        ...params,
        cursor: pageParam as string | undefined,
      } as CursorPaginationParams);
    },

    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNext
        ? lastPage.meta.nextCursor || undefined
        : undefined;
    },
  });
};


"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { messageService } from "@/services/messageService";
import { MessageResponse } from "@/types/message";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useMessages = (conversationId: string) => {
  return useInfiniteQuery<MessageResponse>({
    queryKey: [QUERY_KEYS.MESSAGES, conversationId],
    enabled: !!conversationId,
    initialPageParam: undefined,

    queryFn: ({ pageParam }) =>
      messageService.getMessages(conversationId, {
        cursor: pageParam as string,
        limit: 30,
      }),

    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.nextCursor || undefined : undefined,
  });
};

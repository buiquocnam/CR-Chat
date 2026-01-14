"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { friendService } from "@/services/friendService";
import { CursorPaginationParams } from "@/types/pagination";
import { UserResponse } from "@/types/user";
import { QUERY_KEYS } from "@/constants/queryKeys";


export const useFriends = (active: boolean, params?: CursorPaginationParams) => {

  return useInfiniteQuery<UserResponse>({
    queryKey: [QUERY_KEYS.FRIENDS, params],
    enabled: active,
    initialPageParam: undefined,

    queryFn: async ({ pageParam }) => {
      return friendService.getFriends({
        cursor: pageParam as string,
        limit: 20,
      });
    },

    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNext
        ? lastPage.meta.nextCursor || undefined
        : undefined;
    },
  });
};


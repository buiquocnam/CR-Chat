"use client";

import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { userService } from "@/features/user/services/userService";
import { UserResponse } from "@/types/user";

import { QUERY_KEYS } from "@/constants/queryKeys";

export const useSearchUsers = (query: string) => {
  return useInfiniteQuery<UserResponse, Error, InfiniteData<UserResponse>, string[], string | undefined>({
    queryKey: [QUERY_KEYS.SEARCH_USERS, query],
    queryFn: async ({ pageParam }) => {
      if (!query) return { data: [], meta: { hasNext: false, limit: 20, nextCursor: null } };
      
      return userService.searchUsers(query, {
        cursor: pageParam,
        limit: 20
      });
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => 
      lastPage.meta.hasNext ? lastPage.meta.nextCursor || undefined : undefined,
    enabled: !!query && query.length > 0,
  });
};

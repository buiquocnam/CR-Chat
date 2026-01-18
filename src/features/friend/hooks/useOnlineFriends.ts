"use client";

import { useEffect, useMemo } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { friendService } from "@/features/friend/services/friendService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { CursorPaginationParams } from "@/types/pagination";
import { User, UserResponse } from "@/types/user";
import { DEFAULT_CURSOR_PAGINATION } from "@/lib/pagination";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { SOCKET_EVENTS } from "@/constants/socket";
import { FriendCacheService } from "@/features/friend/services/friendCacheService";

export const useOnlineFriends = (params?: CursorPaginationParams) => {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useInfiniteQuery<UserResponse>({
    queryKey: [QUERY_KEYS.ONLINE_FRIENDS, params],
    enabled: !!accessToken,
    initialPageParam: undefined,

    queryFn: async ({ pageParam }) => {
      return friendService.getOnlineFriends({
        ...DEFAULT_CURSOR_PAGINATION,
        ...params,
        cursor: pageParam as string | undefined,
      });
    },

    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNext
        ? lastPage.meta.nextCursor || undefined
        : undefined;
    },
  });

  const socket = useSocketStore((s) => s.socket);
  const friendCacheService = useMemo(
    () => new FriendCacheService(queryClient),
    [queryClient]
  );

  useEffect(() => {
    if (!socket) return;

    const handleUserOnline = (user: User) => {
      friendCacheService.handleUserOnline(user);
    };

    const handleUserOffline = (userId: string) => {
      friendCacheService.handleUserOffline(userId);
    };

    // Setup listeners
    socket.on(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
    socket.on(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);

    return () => {
      socket.off(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
      socket.off(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
    };
  }, [socket, friendCacheService]);

  return query;
};

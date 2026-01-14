"use client";

import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketStore } from "@/stores/useSocketStore";
import { toast } from "sonner";
import { SOCKET_EVENTS } from "@/constants/socket";
import { FriendCacheService } from "@/services/friendCacheService";

export const useFriendSocket = () => {
  const socket = useSocketStore((state) => state.socket);
  const queryClient = useQueryClient();

  const friendCacheService = useMemo(
    () => new FriendCacheService(queryClient),
    [queryClient]
  );

  useEffect(() => {
    if (!socket) return;

    const onFriendRequestReceived = (sender: any) => {
      toast.info(`${sender.username} đã gửi lời mời kết bạn!`);
      friendCacheService.handleRequestResponse();
    };

    const onFriendRequestAccepted = (acceptedBy: any) => {
      toast.success(`${acceptedBy.username} đã chấp nhận lời mời kết bạn!`);
      friendCacheService.handleAccepted();
    };

    const onFriendRequestRejected = () => {
      friendCacheService.handleRequestResponse();
    };

    const onFriendRequestCanceled = () => {
      friendCacheService.handleRequestResponse();
    };

    const onUnfriended = () => {
      friendCacheService.handleUnfriended();
    };

    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_RECEIVED, onFriendRequestReceived);
    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, onFriendRequestAccepted);
    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_REJECTED, onFriendRequestRejected);
    socket.on(SOCKET_EVENTS.FRIEND_REQUEST_CANCELED, onFriendRequestCanceled);
    socket.on(SOCKET_EVENTS.UNFRIENDED, onUnfriended);

    return () => {
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_RECEIVED, onFriendRequestReceived);
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED, onFriendRequestAccepted);
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_REJECTED, onFriendRequestRejected);
      socket.off(SOCKET_EVENTS.FRIEND_REQUEST_CANCELED, onFriendRequestCanceled);
      socket.off(SOCKET_EVENTS.UNFRIENDED, onUnfriended);
    };
  }, [socket, friendCacheService]);
};

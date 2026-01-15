"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SendMessage, Message } from "@/types/message";
import { useSocketStore } from "@/stores/useSocketStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { v4 as uuidv4 } from 'uuid';
import { SOCKET_EVENTS } from "@/constants/socket";
import { ChatCacheService } from "@/services/chatCacheService";
import { useMemo } from "react";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useSendMessage = (conversationId: string) => {
  const emitAsync = useSocketStore((s) => s.emitAsync);
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((s) => s.user?._id);
  const currentUser = useAuthStore((s) => s.user);

  const chatCacheService = useMemo(
    () => new ChatCacheService(queryClient, currentUserId),
    [queryClient, currentUserId]
  );

  return useMutation({
    mutationFn: (data: SendMessage) => emitAsync(SOCKET_EVENTS.SEND_MESSAGE, data),

    onMutate: async (newMessage) => {
      const queryKey = [QUERY_KEYS.MESSAGES, conversationId];
      await queryClient.cancelQueries({ queryKey });

      const previousMessages = queryClient.getQueryData(queryKey);

      // Create optimistic message
      const tempId = uuidv4();
      const optimisticMessage: Message = {
        _id: tempId,
        conversationId: newMessage.conversationId,
        senderId: currentUser!,
        type: newMessage.type,
        content: newMessage.content,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
        status: "sending" as const,
        replyTo: undefined
      };

      chatCacheService.optimisticMessageAdd(conversationId, optimisticMessage);

      return { previousMessages, tempId };
    },

    onError: (err, newMessage, context) => {
      if (context?.tempId) {
        chatCacheService.optimisticMessageError(conversationId, context.tempId);
      }
    },

    onSuccess: (data: Message, newMessage, context) => {
       if (context?.tempId) {
         chatCacheService.optimisticMessageSuccess(conversationId, context.tempId, data);
       }
    }
  });
};

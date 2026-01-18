"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SendMessage, Message } from "@/types/message";
import { useSocketStore } from "@/stores/useSocketStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { v4 as uuidv4 } from 'uuid';
import { SOCKET_EVENTS } from "@/constants/socket";
import { ChatCacheService } from "@/features/chat/services/chatCacheService";
import { useMemo } from "react";
import { QUERY_KEYS } from "@/constants/queryKeys";

import { useChatStore } from "@/stores/useChatStore";

export const useSendMessage = (conversationId: string) => {
  const emitAsync = useSocketStore((s) => s.emitAsync);
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((s) => s.user?._id);
  const currentUser = useAuthStore((s) => s.user);
  const clearReplyingTo = useChatStore((s) => s.clearReplyingTo);
  const replyingTo = useChatStore((s) => s.replyingTo);

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
        replyTo: replyingTo ? {
          _id: replyingTo._id,
          conversationId: replyingTo.conversationId,
          senderId: replyingTo.senderId,
          type: replyingTo.type,
          content: replyingTo.content,
          isDeleted: replyingTo.isDeleted,
          createdAt: replyingTo.createdAt,
          updatedAt: replyingTo.updatedAt,
          __v: replyingTo.__v || 0
        } : undefined
      };

      chatCacheService.optimisticMessageAdd(conversationId, optimisticMessage);
      
      // Clear reply state immediately on mutate
      clearReplyingTo();

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

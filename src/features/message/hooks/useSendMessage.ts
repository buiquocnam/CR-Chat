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
import { messageService } from "@/features/message/services/messageService";


export const useSendMessage = (conversationId?: string) => {
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
    mutationFn: (data: SendMessage) => {
        // Use API instead of Socket
        return messageService.sendMessage({
            ...data,
            conversationId // Pass conversationId as well
        });
    },

    onMutate: async (newMessage) => {
      // If no conversationId, we cannot optimistically update correctly yet
      // unless we assume a temp ID for the conversation, which is complex.
      // So we skip optimistic update for first message.
      if (!conversationId) {
          clearReplyingTo();
          return { previousMessages: null, tempId: null };
      }

      const queryKey = [QUERY_KEYS.MESSAGES, conversationId];
      await queryClient.cancelQueries({ queryKey });

      const previousMessages = queryClient.getQueryData(queryKey);

      // Create optimistic message
      const tempId = uuidv4();
      
        const optimisticMessage: Message = {
        _id: tempId,
        conversationId: conversationId,
        senderId: currentUser!,
        content: newMessage.content,
        imgUrl: newMessage.imgUrl,
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      };

      chatCacheService.optimisticMessageAdd(conversationId, optimisticMessage);
      
      // Clear reply state immediately on mutate
      clearReplyingTo();

      return { previousMessages, tempId };
    },

    onError: (err, newMessage, context) => {
      if (context?.tempId && conversationId) {
        chatCacheService.optimisticMessageError(conversationId, context.tempId);
      }
    },

    onSuccess: (response, newMessage, context) => { // data: { message, conversationId } or { message } from API
       // API returns { message: ... }
       const realMessage = response.message;
       
       if (context?.tempId && conversationId) {
         chatCacheService.optimisticMessageSuccess(conversationId, context.tempId, realMessage);
       }
       
       // Handle conversation list update
       // For sender, unread count is 0. Backend socket will sync others.
       // We pass a dummy or actual unreadCounts if API returns it, or empty.
       // Note: response might need to be checked for unreadCounts structure
       chatCacheService.handleNewMessage({ 
          message: realMessage, 
          unreadCounts: (response as any).unreadCounts || {} 
       }, conversationId);
    }
  });
};

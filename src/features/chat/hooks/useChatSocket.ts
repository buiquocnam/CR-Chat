"use client";

import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useSocketStore } from "@/stores/useSocketStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Conversation } from "@/types/conversation";
import { Message } from "@/types/message";
import { SOCKET_EVENTS } from "@/constants/socket";
import { ChatCacheService } from "@/features/chat/services/chatCacheService";

export const useChatSocket = () => {
  const socket = useSocketStore((state) => state.socket);
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?._id);
  const params = useParams();
  const activeConversationId = params?.id as string | undefined;

  // Initialize the Domain Layer service
  const chatCacheService = useMemo(
    () => new ChatCacheService(queryClient, currentUserId),
    [queryClient, currentUserId]
  );

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      const newMessage = data.message;
      if (!newMessage) {
          console.error("Invalid new_message payload:", data);
          return;
      }
    
      const senderId = typeof newMessage.senderId === 'string' 
          ? newMessage.senderId 
          : newMessage.senderId?._id;
          
      if (senderId === currentUserId) return;
      
      // Pass the full data object which includes message and unreadCounts
      chatCacheService.handleNewMessage(data, activeConversationId);
    };

    const handleNewConversation = (conversation: Conversation) => {
      chatCacheService.handleNewConversation(conversation);
    };

    const handleMessageSeen = (data: { conversationId: string; userId: string; messageId: string }) => {
      chatCacheService.handleMessageSeen(data);
    };

    const handleMessageDeleted = (data: { conversationId: string; messageId: string }) => {
      chatCacheService.handleMessageDeleted(data);
    };

    // Event Listeners
    socket.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    socket.on(SOCKET_EVENTS.NEW_CONVERSATION, handleNewConversation);
    socket.on(SOCKET_EVENTS.MESSAGE_SEEN, handleMessageSeen);
    socket.on(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);

    // Join Conversation Room
    if (activeConversationId) {
      socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, activeConversationId, (res: any) => {
        if (res?.status !== "ok") console.error("Failed to join conversation", res);
      });
    }

    return () => {
      // Event Cleanup
      socket.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socket.off(SOCKET_EVENTS.NEW_CONVERSATION, handleNewConversation);
      socket.off(SOCKET_EVENTS.MESSAGE_SEEN, handleMessageSeen);
      socket.off(SOCKET_EVENTS.MESSAGE_DELETED, handleMessageDeleted);

      // Leave Conversation Room
      if (activeConversationId) {
        socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, activeConversationId);
      }
    };
  }, [socket, chatCacheService, activeConversationId]);
};

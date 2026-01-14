import { QueryClient, InfiniteData } from "@tanstack/react-query";
import { Message, MessageResponse } from "@/types/message";
import { Conversation, ConversationResponse } from "@/types/conversation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { 
  prependInfiniteCacheItem, 
  updateInfiniteCacheItem, 
  moveInfiniteCacheItemToTop 
} from "@/lib/query-utils";

/**
 * ChatCacheService encapsulates all logic for updating the TanStack Query cache
 * for chat-related data. This serves as a Domain Layer bridge between Socket events
 * and the Data layer (Cache).
 */
export class ChatCacheService {
  constructor(private queryClient: QueryClient, private currentUserId?: string) {}

  /**
   * Handles a new message by updating both the conversation list and the messages list.
   */
  handleNewMessage(message: Message, activeConversationId?: string) {
    // 1. Update Conversation List
    this.updateConversationListOnMessage(message);

    // 2. Update Message List if it matches the active conversation
    if (activeConversationId === message.conversationId) {
        this.queryClient.setQueryData<InfiniteData<MessageResponse>>(
      [QUERY_KEYS.MESSAGES, message.conversationId],
      (oldData) => prependInfiniteCacheItem<Message, MessageResponse>(oldData, { ...message, status: "sent" })
    );
    }
  }

  /**
   * Updates or pushes a conversation to the top of the list when a new message arrives.
   */
  private updateConversationListOnMessage(message: Message) {
    this.queryClient.setQueryData<InfiniteData<ConversationResponse>>(
      [QUERY_KEYS.CONVERSATIONS],
      (oldData) => {
        if (!oldData) {
          this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONVERSATIONS] });
          return oldData;
        }

        let targetConversation: Conversation | undefined;
        for (const page of oldData.pages) {
          targetConversation = page.data.find(c => c._id === message.conversationId);
          if (targetConversation) break;
        }

        if (targetConversation) {
          const isMe = message.senderId?._id === this.currentUserId;
          const updatedConversation: Conversation = {
            ...targetConversation,
            lastMessage: message,
            unreadCount: isMe ? targetConversation.unreadCount : (targetConversation.unreadCount || 0) + 1,
            updatedAt: new Date().toISOString()
          };
          return moveInfiniteCacheItemToTop(oldData, message.conversationId, updatedConversation);
        } else {
          // If conversation isn't in cache, invalidate to refetch the updated list
          this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONVERSATIONS] });
          return oldData;
        }
      }
    );
  }


  /**
   * Updates unread count and message statuses when a conversation is marked as seen.
   */
  handleMessageSeen(data: { conversationId: string; userId: string; messageId: string }) {
    // 1. Clear unread count in conversation list if I'm the one who saw it
    if (data.userId === this.currentUserId) {
      this.queryClient.setQueryData<InfiniteData<ConversationResponse>>(
        [QUERY_KEYS.CONVERSATIONS],
        (oldData) => updateInfiniteCacheItem(oldData, data.conversationId, (c) => ({
          ...c,
          unreadCount: 0
        }))
      );
    }

    // 2. Update message statuses in the messages list
    this.queryClient.setQueryData<InfiniteData<MessageResponse>>(
      [QUERY_KEYS.MESSAGES, data.conversationId],
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map(page => {
             const seenIndex = page.data.findIndex(m => m._id === data.messageId);
             return {
               ...page,
               data: page.data.map((msg, index) => {
                 if (msg.senderId._id === this.currentUserId && (seenIndex !== -1 ? index >= seenIndex : true)) {
                    return { ...msg, status: "read" as const };
                 }
                 return msg;
               })
             };
          })
        };
      }
    );
  }

  /**
   * Updates cache when a message is deleted.
   */
  handleMessageDeleted(data: { conversationId: string; messageId: string }) {
    // Update conversation list last message
    this.queryClient.setQueryData<InfiniteData<ConversationResponse>>(
      [QUERY_KEYS.CONVERSATIONS],
      (oldData) => updateInfiniteCacheItem<Conversation, ConversationResponse>(oldData, data.conversationId, (c) => {
        if (c.lastMessage?._id === data.messageId) {
          return { ...c, lastMessage: { ...c.lastMessage, isDeleted: true } };
        }
        return c;
      })
    );

    // Update message list
    this.queryClient.setQueryData<InfiniteData<MessageResponse>>(
      [QUERY_KEYS.MESSAGES, data.conversationId],
      (oldData) => updateInfiniteCacheItem<Message, MessageResponse>(oldData, data.messageId, (msg) => ({
        ...msg,
        isDeleted: true
      }))
    );
  }

  /**
   * Optimistically adds a message to the cache.
   */
  optimisticMessageAdd(conversationId: string, message: Message) {
    this.queryClient.setQueryData<InfiniteData<MessageResponse>>(
      [QUERY_KEYS.MESSAGES, conversationId],
      (old) => prependInfiniteCacheItem<Message, MessageResponse>(old, message)
    );
  }

  /**
   * Updates a message status to failed in the cache.
   */
  optimisticMessageError(conversationId: string, tempId: string) {
    this.queryClient.setQueryData<InfiniteData<MessageResponse>>(
      [QUERY_KEYS.MESSAGES, conversationId],
      (old) => updateInfiniteCacheItem<Message, MessageResponse>(old, tempId, (msg) => ({
        ...msg,
        status: "failed" as const
      }))
    );
  }

  /**
   * Replaces an optimistic message with the real one from server.
   */
  optimisticMessageSuccess(conversationId: string, tempId: string, realMessage: Message) {
    this.queryClient.setQueryData<InfiniteData<MessageResponse>>(
      [QUERY_KEYS.MESSAGES, conversationId],
      (old) => updateInfiniteCacheItem<Message, MessageResponse>(old, tempId, (msg) => ({
        ...realMessage,
        status: "sent" as const
      }))
    );
  }

  /**
   * Adds a new conversation to the list.
   */
  handleNewConversation(conversation: Conversation) {
    this.queryClient.setQueryData<InfiniteData<ConversationResponse>>(
      [QUERY_KEYS.CONVERSATIONS],
      (oldData) => prependInfiniteCacheItem(oldData, conversation)
    );
  }
}

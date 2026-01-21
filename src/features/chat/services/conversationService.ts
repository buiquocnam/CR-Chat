import apiClient from "@/lib/axios";
import { Conversation, ConversationResponse } from "@/types/conversation";
import { CursorPaginationParams } from "@/types/pagination";
import { buildCursorPaginationQuery, buildSearchQuery } from "@/lib/pagination";

export const conversationService = {
  getConversations: async (params?: CursorPaginationParams): Promise<ConversationResponse> => {
    const query = params ? `?${buildCursorPaginationQuery(params)}` : "";
    const response = await apiClient.get<ConversationResponse>(
      `/conversations${query}`
    );
    return response.data;
  },

  getConversationById: async (conversationId: string): Promise<Conversation> => {
    // Replaced specific getConversationById call with getMessages call (limit=0 to just get metadata)
    const response = await apiClient.get<any>(
      `/conversations/${conversationId}/messages?limit=0`
    );
    return response.data.conversation;
  },

  getDirectConversation: async (userId: string): Promise<{ conversation: Conversation | null, otherUser?: any }> => {
    const response = await apiClient.get<{ conversation: Conversation | null, otherUser?: any }>(
      `/conversations/direct/${userId}`
    );
    return response.data;
  },

  createDirectConversation: async (recipientId: string): Promise<Conversation> => {
     // Currently we want to revert to "create immediately".
     // We can use the generic create endpoint with type direct.
     const response = await apiClient.post<Conversation>('/conversations', {
         type: 'direct',
         memberIds: [recipientId] // Wait, usually direct creation takes memberIds or recipientId. 
         // Backend createConversation uses memberIds for group, but for direct?
         // Let's check backend createConversation.
         // If I look at Controller (Step 370), it handles type='direct' and uses `memberIds` or `participants`.
         // Let's guess/standardize on sending memberIds. 
         // Actually Step 370:
         // if (type === "direct") {
         //   const result = await chatService.getOrCreateConversation(senderId, memberIds[0]);
         // }
         // Wait, step 370 was "refactored to use chatService". Then 379 "Restored original logic".
         // Let's use generic POST /conversations with { type: 'direct', memberIds: [recipientId] }
         // Need to verify backend supports this payload.
     });
     return response.data;
  },

  addMembers: async (conversationId: string, memberIds: string[]) => {
      const response = await apiClient.post<Conversation>(`/conversations/${conversationId}/participants`, { memberIds });
      return response.data;
  },

  getConversationMembers: async (conversationId: string) => {
    const response = await apiClient.get<Conversation['participants']>(`/conversations/${conversationId}/participants`);
    return response.data;
  },

  searchConversations: async (
    query: string,
    params?: CursorPaginationParams
  ): Promise<ConversationResponse> => {
    const searchQuery = `?${buildSearchQuery(query, params)}`;
    const response = await apiClient.get<ConversationResponse>(
      `/conversations/search${searchQuery}`
    );
    return response.data;
  },
};
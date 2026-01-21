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
     const response = await apiClient.post<Conversation>('/conversations', {
         type: 'direct',
         memberIds: [recipientId] 
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
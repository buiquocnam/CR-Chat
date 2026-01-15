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
    const response = await apiClient.get<Conversation>(
      `/conversations/${conversationId}`
    );
    return response.data;
  },

  createPrivateConversation: async (friendId: string): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>(
      `/conversations`,
      {
        type: "private",
        memberIds: [friendId]
      }
    );
    return response.data;
  },

  createConversation: async (data: { type: "private" | "group"; memberIds: string[]; name?: string }) => {
    const response = await apiClient.post<Conversation>("/conversations", data);
    return response.data;
  },

  addMembers: async (conversationId: string, memberIds: string[]) => {
      const response = await apiClient.post<Conversation>(`/conversations/${conversationId}/members`, { memberIds });
      return response.data;
  },

  getConversationMembers: async (conversationId: string) => {
    const response = await apiClient.get<Conversation['members']>(`/conversations/${conversationId}/members`);
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
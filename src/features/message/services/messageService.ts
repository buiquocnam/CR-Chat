import apiClient from "@/lib/axios";
import { buildCursorPaginationQuery } from "@/lib/pagination";
import { MessageResponse } from "@/types/message";
import { CursorPaginationParams } from "@/types/pagination";

export const messageService = {
  getMessages: async (
    conversationId: string,
    params?: CursorPaginationParams
  ): Promise<MessageResponse> => {
    const query = params ? `?${buildCursorPaginationQuery(params)}` : "";

    const response = await apiClient.get<any>(
      `/conversations/${conversationId}/messages${query}`
    );

    return {
        data: response.data.messages,
        meta: {
            hasNext: !!response.data.nextCursor,
            nextCursor: response.data.nextCursor,
            limit: params?.limit || 30, // Include limit in meta as per type
        },
        conversation: response.data.conversation
    }; 
  },

  markAsSeen: async (conversationId: string, messageId: string) => {
    const response = await apiClient.patch(`/conversations/${conversationId}/seen`);
    return response.data;
  },

  deleteMessage: async (messageId: string) => {
    const response = await apiClient.delete(`/messages/${messageId}`);
    return response.data;
  },

  sendMessage: async (data: any): Promise<{ message: import("@/types/message").Message }> => {
    // Determine endpoint based on data type? Or just use direct/group routes?
    // Based on backend implementation: /direct takes {recipientId, content, conversationId}
    // /group takes {conversationId, content}
    const endpoint = data.recipientId ? '/messages/direct' : '/messages/group';
    const response = await apiClient.post(endpoint, data);
    return response.data;
  }
};

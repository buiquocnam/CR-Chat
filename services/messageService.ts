import apiClient from "@/lib/axios";
import { buildCursorPaginationQuery } from "@/lib/pagination";
import { MessageResponse, SendMessage, Message } from "@/types/message";
import { CursorPaginationParams } from "@/types/pagination";

export const messageService = {
  getMessages: async (
    conversationId: string,
    params?: CursorPaginationParams
  ): Promise<MessageResponse> => {
    const query = params ? `?${buildCursorPaginationQuery(params)}` : "";

    const response = await apiClient.get(
      `/messages/conversation/${conversationId}${query}`
    );

    return response.data;
  },

  sendMessage: async (data: SendMessage): Promise<Message> => {
    const response = await apiClient.post<Message>("/messages", data);
    return response.data;
  },

  markAsSeen: async (conversationId: string, messageId: string) => {
    const response = await apiClient.post("/messages/seen", {
      conversationId,
      messageId,
    });
    return response.data;
  },

  deleteMessage: async (messageId: string) => {
    const response = await apiClient.delete(`/messages/${messageId}`);
    return response.data;
  },
};

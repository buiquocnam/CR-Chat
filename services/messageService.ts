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
};

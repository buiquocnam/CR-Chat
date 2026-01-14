"use client";

import { useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { useSocketStore } from "@/stores/useSocketStore";
import { MessageResponse } from "@/types/message";
import { toast } from "sonner";

export const useDeleteMessage = (conversationId: string) => {
  const emitAsync = useSocketStore((state) => state.emitAsync);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => emitAsync("delete_message", { messageId }),
    onSuccess: (_, messageId) => {
      // Optimistically update the UI by marking the message as deleted
      queryClient.setQueryData<InfiniteData<MessageResponse>>(
        ["messages", conversationId],
        (oldData) => {
          if (!oldData) return oldData;

          const newPages = oldData.pages.map(page => ({
            ...page,
            data: page.data.map(msg => 
              msg._id === messageId ? { ...msg, isDeleted: true } : msg
            )
          }));

          return { ...oldData, pages: newPages };
        }
      );
      toast.success("Tin nhắn đã được xóa");
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể xóa tin nhắn");
    }
  });
};

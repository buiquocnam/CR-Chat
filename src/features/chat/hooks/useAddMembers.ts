"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/features/chat/services/conversationService";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useAddMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, memberIds }: { conversationId: string; memberIds: string[] }) =>
      conversationService.addMembers(conversationId, memberIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CONVERSATIONS, variables.conversationId],
      });
      toast.success("Thêm thành viên thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Không thể thêm thành viên");
    },
  });
};

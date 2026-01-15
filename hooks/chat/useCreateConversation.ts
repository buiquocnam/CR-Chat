"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/services/conversationService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useCreateConversation = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: conversationService.createConversation,
        onSuccess: (data) => {
            // Invalidate conversations list
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONVERSATIONS] });
            
            // Navigate to new conversation
            router.push(`/chat/${data._id}`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Không thể tạo cuộc trò chuyện");
        }
    });
};

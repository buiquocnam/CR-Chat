"use client";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMe } from "@/features/auth/hooks/useMe";
import { useRouter } from "next/navigation";
// import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";
export const useSignIn = () => {
  const { setAccessToken, clear } = useAuthStore();
  const { refetch } = useMe();
//   const fetchConversations = useChatStore((s) => s.fetchConversations);
  const router = useRouter();
  return useMutation({
    mutationFn: ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => authService.signIn(email, password),

    onSuccess: async ({ accessToken }) => {
      setAccessToken(accessToken);
      await refetch();
      // fetchConversations();
      router.replace("/");
      toast.success("Chào mừng bạn quay lại với Moji 🎉");
    },

    onError: () => {
      clear();
      toast.error("Đăng nhập không thành công!");
    },
  });
};

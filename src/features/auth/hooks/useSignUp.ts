"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMe } from "@/features/auth/hooks/useMe";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useSignUp = () => {
  const { setAccessToken, clear } = useAuthStore();
  const { refetch } = useMe();
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      username,
      email,
      password,
    }: {
      username: string;
      email: string;
      password: string;
    }) => authService.signUp(username, email, password),

    onSuccess: async ({ accessToken }) => {
      setAccessToken(accessToken);
      await refetch();
      router.push("/");
      toast.success("Đăng ký thành công! 🎉");
    },

    onError: (error: any) => {
      clear();
      const message = error?.response?.data?.message || "Đăng ký thất bại!";
      toast.error(message);
    },
  });
};

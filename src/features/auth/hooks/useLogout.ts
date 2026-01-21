"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSocketStore } from "@/stores/useSocketStore";

export const useLogout = () => {
  const { clear } = useAuthStore();
  const router = useRouter();
  const socket = useSocketStore((state) => state.socket);

  return useMutation({
    mutationFn: authService.signOut,
    onSuccess: () => {
      // Disconnect socket if connected
      if (socket) {
        socket.disconnect();
      }
      
      clear();
      // Clear middleware flag cookie
      document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      router.push("/login"); // or /signup
      toast.success("Đã đăng xuất thành công!");
    },
    onError: () => {
      // Even if API fails, clear local state
      if (socket) {
        socket.disconnect();
      }
      clear();
      router.push("/login");
      toast.error("Đã đăng xuất (có lỗi xảy ra)");
    },
  });
};

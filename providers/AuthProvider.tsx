"use client";

import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import {Spinner} from "@/components/ui/spinner"
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1️⃣ Refresh token
        const accessToken = await authService.refresh();
        setAccessToken(accessToken);
        // 2️⃣ Lấy thông tin user
        const user = await authService.fetchMe();
        setUser(user);
      } catch (error) {
        await authService.signOut();
        clear();
      } finally {
        // 3️⃣ Đánh dấu đã init xong
        setInitialized(true);
      }
    };

    initAuth();
  }, [setUser, clear]);

  // ⛔ Chặn render UI khi auth chưa init
  if (!initialized) return <div className="flex h-screen items-center justify-center"><Spinner className="size-10 animate-spin"/></div>;

  return <>{children}</>;
}

"use client";

import { authService } from "@/features/auth/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const PUBLIC_ROUTES = ["/login", "/signup"];

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { accessToken, user, setAccessToken, setUser, clear } = useAuthStore();
  const [starting, setStarting] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const initAuth = async () => {
    try {
      // 1. Thử refresh nếu chưa có token (khi F5 trang)
      if (!accessToken) {
        const token = await authService.refresh();
        setAccessToken(token);
      }

      // 2. Lấy thông tin user nếu đã có token
      const currentToken = useAuthStore.getState().accessToken;
      if (currentToken && !user) {
        const userData = await authService.fetchMe();
        setUser(userData);
      }
    } catch (error) {
      clear();
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (starting) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!isPublicRoute && !accessToken) {
      router.replace("/login");
    } else if (isPublicRoute && accessToken) {
      router.replace("/");
    }
  }, [starting, accessToken, pathname, router]);

  if (starting && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="flex h-screen items-center justify-center">
        Đang tải trang...
      </div>
    );
  }

  return <>{children}</>;
}

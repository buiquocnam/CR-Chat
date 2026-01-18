"use client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import type { User } from "@/types/user";

export const useMe = () => {
  const setUser = useAuthStore((s) => s.setUser);

  const query = useQuery<User>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await authService.fetchMe();
      console.log(res);
      return res;
    },
    enabled: false,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
};

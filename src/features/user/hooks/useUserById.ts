"use client";

import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/userService";
import { QUERY_KEYS } from "@/constants/queryKeys";

export const useUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS, userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
  });
};

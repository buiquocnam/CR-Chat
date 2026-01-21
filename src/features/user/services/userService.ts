import apiClient from "@/lib/axios";
import { User, UserResponse } from "@/types/user";
import { CursorPaginationParams } from "@/types/pagination";
import { buildSearchQuery } from "@/lib/pagination";

export const userService = {
  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  searchUsers: async (
    query: string,
    params?: CursorPaginationParams
  ): Promise<UserResponse> => {
    const searchQuery = `?${buildSearchQuery(query, params)}`;
    const response = await apiClient.get<UserResponse>(
      `/users/search${searchQuery}`
    );
    return response.data;
  },

  updateProfile: async (data: {
    displayName?: string;
    avatarUrl?: string;
    bio?: string;
    phone?: string;
  }): Promise<User> => {
    const response = await apiClient.put<User>(`/users/profile`, data);
    return response.data;
  },
};
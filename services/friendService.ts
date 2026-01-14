import apiClient from "@/lib/axios";
import { User, UserResponse } from "@/types/user";
import { CursorPaginationParams } from "@/types/pagination";
import { buildCursorPaginationQuery, buildSearchQuery } from "@/lib/pagination";

export interface FriendRequestsResponse {
  sent: {
    data: Array<{
      _id: string;
      user: User;
      status: string;
      createdAt: string;
    }>;
    meta: {
      limit: number;
      hasNext: boolean;
      nextCursor: string | null;
    };
  };
  received: {
    data: Array<{
      _id: string;
      user: User;
      status: string;
      createdAt: string;
    }>;
    meta: {
      limit: number;
      hasNext: boolean;
      nextCursor: string | null;
    };
  };
}

export const friendService = {
  getOnlineFriends: async (params?: CursorPaginationParams): Promise<UserResponse> => {
    const query = params ? `?${buildCursorPaginationQuery(params)}` : "";
    const response = await apiClient.get<UserResponse>(
      `/friends/online${query}`
    );
    return response.data;
  },

  getFriends: async (params?: CursorPaginationParams): Promise<UserResponse> => {
    const query = params ? `?${buildCursorPaginationQuery(params)}` : "";
    const response = await apiClient.get<UserResponse>(
      `/friends${query}`
    );
    return response.data;
  },

  getFriendRequests: async (params?: CursorPaginationParams): Promise<FriendRequestsResponse> => {
    const query = params ? `?${buildCursorPaginationQuery(params)}` : "";
    const response = await apiClient.get<FriendRequestsResponse>(
      `/friends/requests${query}`
    );
    return response.data;
  },

  searchFriends: async (
    query: string,
    params?: CursorPaginationParams
  ): Promise<UserResponse> => {
    const searchQuery = `?${buildSearchQuery(query, params)}`;
    const response = await apiClient.get<UserResponse>(
      `/friends/search${searchQuery}`
    );
    return response.data;
  },
};

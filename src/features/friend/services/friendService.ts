import apiClient from "@/lib/axios";
import { User, UserResponse } from "@/types/user";
import { CursorPaginationParams } from "@/types/pagination";
import { buildCursorPaginationQuery, buildSearchQuery } from "@/lib/pagination";

export interface FriendRequestsResponse {
  sent: Array<{
    _id: string;
    from: string;
    to: User;
    status: string;
    createdAt: string;
  }>;
  received: Array<{
    _id: string;
    from: User;
    to: string;
    status: string;
    createdAt: string;
  }>;
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

  sendRequest: async (receiverId: string) => {
    // Backend expects { to: string, message?: string }
    const res = await apiClient.post("/friends/requests", { to: receiverId });
    return res.data;
  },

  acceptRequest: async (requestId: string) => {
    const res = await apiClient.post(`/friends/requests/${requestId}/accept`);
    return res.data;
  },

  rejectRequest: async (requestId: string) => {
    const res = await apiClient.post(`/friends/requests/${requestId}/decline`);
    return res.data;
  },

  cancelRequest: async (requestId: string) => {
    const res = await apiClient.post(`/friends/requests/${requestId}/decline`);
    return res.data;
  },

  unfriend: async (friendId: string) => {
    const res = await apiClient.post("/friends/unfriend", { friendId });
    return res.data;
  },
};

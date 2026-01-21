import { QueryClient, InfiniteData } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { prependInfiniteCacheItem, removeInfiniteCacheItem } from "@/lib/query-utils";
import { UserResponse } from "@/types/user";

/**
 * FriendCacheService handles cache invalidation and updates for friend-related data.
 */
export class FriendCacheService {
  constructor(private queryClient: QueryClient) {}

  handleRequestResponse() {
    this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SEARCH_USERS] });
    this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FRIEND_REQUESTS] });
  }

  handleAccepted() {
    this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SEARCH_USERS] });
    this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FRIENDS] });
    this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FRIEND_REQUESTS] });
    this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ONLINE_FRIENDS] });
  }

  handleRejected() {
    this.handleRequestResponse();
  }

  handleUnfriended() {
    this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SEARCH_USERS] });
    this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FRIENDS] });
    this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ONLINE_FRIENDS] });
  }

  handleUserOnline(user: any) {
    this.queryClient.setQueriesData<InfiniteData<any>>(
      { queryKey: [QUERY_KEYS.ONLINE_FRIENDS] },
      (old) => prependInfiniteCacheItem(old, user)
    );
  }

  handleUserOffline(userId: string) {
    this.queryClient.setQueriesData<InfiniteData<any>>(
      { queryKey: [QUERY_KEYS.ONLINE_FRIENDS] },
      (old) => removeInfiniteCacheItem(old, userId)
    );
  }

  /**
   * Optimistically update the relationship status of a user in the search results.
   * This avoids re-fetching the entire search list.
   */
  updateSearchUserRelationship(userId: string, relationship: 'friend' | 'request_sent' | 'request_received' | 'none', friendRequestId?: string) {
    this.queryClient.setQueriesData<InfiniteData<UserResponse>>(
      { queryKey: [QUERY_KEYS.SEARCH_USERS] }, // Matches all search queries
      (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((user) => {
              if (user._id === userId) {
                return { ...user, relationship, friendRequestId };
              }
              return user;
            }),
          })),
        };
      }
    );
  }
}

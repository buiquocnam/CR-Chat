import { CursorPaginationParams } from "@/types/pagination";

/**
 * Default cursor pagination parameters
 */
export const DEFAULT_CURSOR_PAGINATION: CursorPaginationParams = {
  limit: 20,
};

/**
 * Build query string for cursor pagination
 * @param params - Cursor pagination parameters
 * @returns Query string (e.g., "cursor=xxx&limit=20")
 */
export function buildCursorPaginationQuery(
  params: CursorPaginationParams
): string {
  const queryParams = new URLSearchParams();
  
  if (params.cursor) {
    queryParams.append("cursor", params.cursor);
  }
  
  if (params.limit) {
    queryParams.append("limit", params.limit.toString());
  }
  
  return queryParams.toString();
}

/**
 * Build query string for search with cursor pagination
 * @param query - Search query string
 * @param params - Cursor pagination parameters
 * @returns Query string (e.g., "q=search&cursor=xxx&limit=20")
 */
export function buildSearchQuery(
  query: string,
  params?: CursorPaginationParams
): string {
  const queryParams = new URLSearchParams();
  
  queryParams.append("q", query);
  
  if (params?.cursor) {
    queryParams.append("cursor", params.cursor);
  }
  
  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }
  
  return queryParams.toString();
}


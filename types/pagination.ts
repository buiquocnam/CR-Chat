// Cursor Pagination Types (matching backend)
export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface CursorPaginationMeta {
  limit: number;
  hasNext: boolean;
  nextCursor: string | null;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  meta: CursorPaginationMeta;
}

// Legacy types (for backward compatibility if needed)
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface OffsetPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: OffsetPaginationMeta;
}

// Alias for convenience
export type CursorPagination<T> = CursorPaginatedResponse<T>;
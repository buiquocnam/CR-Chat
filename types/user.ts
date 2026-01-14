import { CursorPaginatedResponse } from "./pagination";

export interface User {
  _id: string;
  email?: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  relationship?: 'friend' | 'request_sent' | 'request_received' | 'none';
  friendRequestId?: string;
}

export type UserResponse = CursorPaginatedResponse<User>;
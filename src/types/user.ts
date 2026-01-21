import { CursorPaginatedResponse } from "./pagination";

export interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  avatarId?: string;
  bio?: string;     
  phone?: string;
  isOnline?: boolean;     // Computed/Status
  lastSeen?: Date;        // Computed/Status
  createdAt: string;      // ISO string
  updatedAt: string;      // ISO string
  
  // Relationship status (likely computed or from separate query)
  relationship?: 'friend' | 'request_sent' | 'request_received' | 'none';
  friendRequestId?: string;
}

export type UserResponse = CursorPaginatedResponse<User>;
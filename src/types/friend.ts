
import type { User } from "./user";
import { CursorPaginatedResponse } from "./pagination";

export interface Friend {
  _id: string;
  userA: string | User;
  userB: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  _id: string;
  from: string | User;
  to: string | User;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export type FriendResponse = CursorPaginatedResponse<Friend>;
export type FriendRequestResponse = CursorPaginatedResponse<FriendRequest>;

import { CursorPaginatedResponse } from "./pagination";
import type { User } from "./user";

export type ConversationType = "private" | "group";

export interface Conversation {
  _id: string;
  type: ConversationType;
  name?: string;        
  avatar?: string;
  createdBy: User;
  createdAt: string;     // ISO string
  updatedAt: string;     // ISO string
  __v?: number;
  members?: Array<{
    userId: User;
    role: "admin" | "member";
  }>;
  otherMember?: User; // Information about the other user in private chats
  unreadCount?: number;
  lastMessage?: any;
  lastReadMessageId?: string; // ID of the last message read by the current user
}

export type ConversationResponse = CursorPaginatedResponse<Conversation>;
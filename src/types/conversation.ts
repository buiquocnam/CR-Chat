import { CursorPaginatedResponse } from "./pagination";
import type { User } from "./user";

export type ConversationType = "direct" | "group";

export interface Conversation {
  _id: string;
  type: ConversationType;
  participants: {
    _id: string;
    displayName: string;
    avatarUrl: string | null;
    joinedAt: string;
  }[];
  group?: {
    name?: string;
    createdBy?: string; // User ID
  };
  lastMessageAt?: string;
  seenBy?: User[];       // Populated Users
  lastMessage?: {
    _id: string;
    content: string;
    senderId: User;      // Populated User
    imgUrl?: string; // Add this
    createdAt: string;
  } | null;
  unreadCounts?: { [userId: string]: number };
  
  createdAt: string;     // ISO string
  updatedAt: string;     // ISO string
  __v?: number;

  // Computed or older fields to review/remove if unused
  otherMember?: User; // Frontend helper for direct chats
}

export type ConversationResponse = CursorPaginatedResponse<Conversation>;
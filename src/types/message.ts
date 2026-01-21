import { User } from "./user";
import { CursorPaginatedResponse } from "./pagination";
import { Conversation } from "./conversation";

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string | User;
  content: string;
  imgUrl?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface SendMessage {
  recipientId?: string;
  conversationId?: string;
  content: string;
  imgUrl?: string;
}

export type MessageResponse = CursorPaginatedResponse<Message> & {
  conversation: Conversation;
};
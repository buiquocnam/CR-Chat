import { User } from "./user";
import { CursorPaginatedResponse } from "./pagination";

export interface MessageReplyTo {
  _id: string;
  conversationId: string;
  senderId: User;
  type: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface Message {
  _id: string;
  conversationId: string;
  senderId: User;
  type: "text" | "image" | "file";
  content: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  replyTo?: MessageReplyTo;
  status?: MessageStatus;
  seenBy?: User[];
}

export interface SendMessage {
  conversationId: string;
  type: "text" | "image" | "file";
  content: string;
  replyTo?: string;
}

export type MessageResponse = CursorPaginatedResponse<Message>;
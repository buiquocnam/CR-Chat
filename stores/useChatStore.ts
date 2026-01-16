import { create } from "zustand";
import { Message } from "@/types/message";

interface ChatState {
  replyingTo: Message | null;
  setReplyingTo: (message: Message | null) => void;
  clearReplyingTo: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  replyingTo: null,
  setReplyingTo: (message) => set({ replyingTo: message }),
  clearReplyingTo: () => set({ replyingTo: null }),
}));

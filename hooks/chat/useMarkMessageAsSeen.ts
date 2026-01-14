import { useSocketStore } from "@/stores/useSocketStore";

export const useMarkMessageAsSeen = () => {
  const emitAsync = useSocketStore((s) => s.emitAsync);

  const markAsSeen = (conversationId: string, messageId: string) => {
    emitAsync("seen_message", { conversationId, messageId }).catch((err) => {
      console.error("Mark as seen error:", err);
    });
  };

  return { markAsSeen };
};


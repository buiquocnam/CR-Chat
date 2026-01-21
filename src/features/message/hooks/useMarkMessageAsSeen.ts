import { useSocketStore } from "@/stores/useSocketStore";
import { SOCKET_EVENTS } from "@/constants/socket";

export const useMarkMessageAsSeen = () => {
  const emitAsync = useSocketStore((s) => s.emitAsync);

  const markAsSeen = (conversationId: string, messageId: string) => {
    emitAsync(SOCKET_EVENTS.MARK_SEEN, { conversationId, messageId }).catch((err) => {
      console.error("Mark as seen error:", err);
    });
  };

  return { markAsSeen };
};


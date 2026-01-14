import { useState, useRef, useCallback, useEffect } from "react";

const SCROLL_THRESHOLD = 150;
const LOAD_MORE_THRESHOLD = 200;

interface UseChatScrollProps {
  conversationId: string;
  data: any;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<any>;
  lastReadMessageId?: string;
  currentUserId?: string;
}

export const useChatScroll = ({
  conversationId,
  data,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  lastReadMessageId,
  currentUserId,
}: UseChatScrollProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);
  const [showNewMessageNotification, setShowNewMessageNotification] = useState(false);


  // Helper: Kiểm tra xem người dùng có đang ở gần đáy không
  const isNearBottom = useCallback(() => {
    if (!containerRef.current) return false;
    const container = containerRef.current;
    
    // Dung sai tăng lên một chút để nhạy hơn (ví dụ 100px)
    const threshold = 100; 
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceToBottom < threshold;
  }, []);

  // Helper: Cuộn xuống cuối
  const scrollToBottom = useCallback((smooth = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  }, []);

  // 1. Reset state khi thay đổi cuộc trò chuyện
  useEffect(() => {
    previousMessageCountRef.current = 0;
    setTimeout(() => setShowNewMessageNotification(false), 0);
  }, [conversationId]);

  // 2. Logic cuộn ban đầu (Smart Scroll)
  const currentMessageCount = data?.pages[0]?.data.length ?? 0;
  
  useEffect(() => {
    if (!isLoading && data && containerRef.current && previousMessageCountRef.current === 0) {
      const allMessages = data.pages.flatMap((page: any) => page.data).reverse();
      
      let targetMessageId = null;
      if (lastReadMessageId) {
          const lastReadIndex = allMessages.findIndex((m: any) => m._id === lastReadMessageId);
          if (lastReadIndex !== -1 && lastReadIndex < allMessages.length - 1) {
              targetMessageId = allMessages[lastReadIndex + 1]._id;
          } 
      }

      if (targetMessageId) {
           const element = document.getElementById(`message-${targetMessageId}`);
           if (element) {
               element.scrollIntoView({ behavior: "auto", block: "center" });
           } else {
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
           }
      } else {
           containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }

      previousMessageCountRef.current = currentMessageCount;
    }
  }, [isLoading, data, currentMessageCount, lastReadMessageId]);

  // 3. Xử lý Tự động cuộn khi có Tin nhắn mới & Thông báo
  useEffect(() => {
    if (currentMessageCount <= previousMessageCountRef.current) {
      previousMessageCountRef.current = currentMessageCount;
      return;
    }

    const hasNewMessages = currentMessageCount > previousMessageCountRef.current;
    previousMessageCountRef.current = currentMessageCount;

    if (hasNewMessages) {
       const latestMessage = data?.pages[0]?.data[0];
       
       const isMyMessage = currentUserId && latestMessage?.senderId?._id === currentUserId;

       if (isMyMessage || isNearBottom()) {
          scrollToBottom(true);
          setShowNewMessageNotification(false);
       } else {
          setShowNewMessageNotification(true);
       }
    }
  }, [currentMessageCount, isNearBottom, scrollToBottom, data, currentUserId]);

  // 4. Xử lý Infinite Scroll (Tải thêm)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isNearBottom() && showNewMessageNotification) {
        setShowNewMessageNotification(false);
      }

      // Kích hoạt tải thêm khi cuộn lên trên
      if (container.scrollTop < LOAD_MORE_THRESHOLD && hasNextPage && !isFetchingNextPage) {
        const previousScrollHeight = container.scrollHeight;
        fetchNextPage().then(() => {
          if (container) {
            // Giữ nguyên vị trí cuộn sau khi tải tin nhắn cũ hơn
            const scrollDifference = container.scrollHeight - previousScrollHeight;
            container.scrollTop = scrollDifference;
          }
        });
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, showNewMessageNotification, isNearBottom]);

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom(true);
    setShowNewMessageNotification(false);
  }, [scrollToBottom]);

  return {
    containerRef,
    messagesEndRef,
    showNewMessageNotification,
    handleScrollToBottom,
  };
};

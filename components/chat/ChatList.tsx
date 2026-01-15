"use client";

import { Conversation } from "@/types/conversation";
import { useRouter } from "next/navigation";
import { useInfiniteScroll } from "@/hooks/shared/useInfiniteScroll";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import ChatItem from "./ChatItem";
import { ScrollArea } from "@/components/ui/scroll-area";


interface ChatListProps {
  data: Conversation[] | undefined;
  isLoading: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}


export default function ChatList({
  data,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: ChatListProps) {
  const currentUser = useAuthStore((s) => s.user);
  const router = useRouter();

  // Infinite scroll for loading more conversations
  const { loadMoreRef } = useInfiniteScroll({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage: isFetchingNextPage ?? false,
    fetchNextPage: fetchNextPage ?? (() => { }),
  });

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-muted-foreground">No conversations found</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-2 pb-4">
        {data.map((conversation) => (
          <ChatItem
            key={conversation._id}
            conversation={conversation}
            onClick={(id) => router.push(`/${id}`)}
            currentUser={currentUser}
          />
        ))}

        {/* Load more trigger */}
        {hasNextPage && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isFetchingNextPage ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-xs text-muted-foreground">Load more conversations</p>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
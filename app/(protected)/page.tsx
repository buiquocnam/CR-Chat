"use client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { FriendOnline } from "@/components/friend";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConversations } from "@/hooks/chat";
import { useSearchConversations } from "@/hooks/chat/useSearchConversations";
import { useDebounce } from "@/hooks/shared/useDebounce";
import ChatList from "@/components/chat/ChatList";
import { Conversation } from "@/types/conversation";

const tabs = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Friend",
    value: "friend",
  },
  {
    label: "Group",
    value: "group",
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState("all");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Use search if there's a query, otherwise use regular conversations
  const isSearching = debouncedSearchQuery.trim().length > 0;
  const conversationsQuery = useConversations();
  const searchQueryResult = useSearchConversations(debouncedSearchQuery);

  // Choose which query to use
  const activeQuery = isSearching ? searchQueryResult : conversationsQuery;
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = activeQuery;

  // Filter conversations by tab
  let filteredData: Conversation[] = data?.pages.flatMap((page) => page.data) ?? [];
  if (tab === "friend") {
    filteredData = filteredData.filter((c) => c.type === "private");
  } else if (tab === "group") {
    filteredData = filteredData.filter((c) => c.type === "group");
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Messages</h1>
      <div className="mb-6 border-b pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <div className="mb-4">
        <FriendOnline />
      </div>

      <Tabs defaultValue="all" value={tab} onValueChange={setTab}>
        <TabsList >
          {tabs.map((tabItem) => (
            <TabsTrigger key={tabItem.value} value={tabItem.value}>
              {tabItem.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tabItem) => (
          <TabsContent className="w-full" key={tabItem.value} value={tabItem.value}>
            <ChatList
              data={filteredData.length > 0 ? filteredData : undefined}
              isLoading={isLoading}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
"use client";

import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { FriendOnline } from "@/components/friend";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConversations } from "@/hooks/chat";
import { useSearchConversations } from "@/hooks/chat/useSearchConversations";
import { useDebounce } from "@/hooks/shared/useDebounce";
import ChatList from "@/components/chat/ChatList";
import { Conversation } from "@/types/conversation";
import { CreateConversationDialog } from "@/components/chat/CreateConversationDialog";
import { Button } from "@/components/ui/button";
import { useChatSocket } from "@/hooks/chat/useChatSocket";

const tabs = [
    { label: "All", value: "all" },
    { label: "Private", value: "friend" },
    { label: "Group", value: "group" },
];

export function ChatSidebar() {
    const [searchQuery, setSearchQuery] = useState("");
    const [tab, setTab] = useState("all");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Initialize Socket Listeners
    useChatSocket();

    const isSearching = debouncedSearchQuery.trim().length > 0;
    const conversationsQuery = useConversations();
    const searchQueryResult = useSearchConversations(debouncedSearchQuery);

    const activeQuery = isSearching ? searchQueryResult : conversationsQuery;
    const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = activeQuery;

    let filteredData: Conversation[] = data?.pages.flatMap((page) => page.data) ?? [];

    // Client-side filtering for tabs (since backend might not support distinct tabs endpoint yet)
    if (!isSearching) {
        if (tab === "friend") {
            filteredData = filteredData.filter((c) => c.type === "private");
        } else if (tab === "group") {
            filteredData = filteredData.filter((c) => c.type === "group");
        }
    }

    return (
        <div className="flex flex-col h-full bg-background/50 border-r w-full md:w-[380px] lg:w-[420px]">
            <div className="p-4 pb-0 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Chats</h1>
                    <CreateConversationDialog />
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
                    />
                </div>

                <FriendOnline />

                <Tabs defaultValue="all" value={tab} onValueChange={setTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-3 p-1 h-auto bg-muted/50">
                        {tabs.map((tabItem) => (
                            <TabsTrigger
                                key={tabItem.value}
                                value={tabItem.value}
                                className="text-xs py-2 data-[state=active]:bg-background"
                            >
                                {tabItem.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex-1 overflow-hidden pt-4 px-2">
                <ChatList
                    data={filteredData.length > 0 ? filteredData : undefined}
                    isLoading={isLoading}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={fetchNextPage}
                />
            </div>
        </div>
    );
}

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
        <div className="flex flex-col h-full w-full md:w-[320px] lg:w-[360px] xl:w-[400px] border-r border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="p-4 pb-2 space-y-5">
                <div className="flex items-center justify-between px-1 mt-2">
                    <h1 className="text-xl font-bold tracking-tight text-foreground/90">Messages</h1>
                    <CreateConversationDialog />
                </div>

                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 bg-white/40 border-0 shadow-sm rounded-2xl ring-1 ring-white/20 focus-visible:ring-primary/20 focus-visible:bg-white/60 transition-all placeholder:text-muted-foreground/50"
                    />
                </div>

                <FriendOnline />

                <Tabs defaultValue="all" value={tab} onValueChange={setTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-3 p-1 h-9 bg-black/5 rounded-xl">
                        {tabs.map((tabItem) => (
                            <TabsTrigger
                                key={tabItem.value}
                                value={tabItem.value}
                                className="text-[11px] font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                            >
                                {tabItem.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex-1 overflow-hidden pt-2 px-3 pb-3">
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

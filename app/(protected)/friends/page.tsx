"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FriendRequestList, FriendsList } from "@/components/friend";
import { useState } from "react";
import SearchUserDialog from "@/components/user/SearchUserDialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default function FriendPage() {
  const [activeTab, setActiveTab] = useState<"requests" | "friends">("requests");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
           <h1 className="text-3xl font-bold tracking-tight">Bạn bè</h1>
           <Button onClick={() => setIsSearchOpen(true)}>
               <UserPlus className="w-4 h-4 mr-2" />
               Thêm bạn mới
           </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "requests" | "friends")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="requests">Lời mời kết bạn</TabsTrigger>
          <TabsTrigger value="friends">Danh sách bạn bè</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <FriendRequestList active={activeTab === "requests"} />
        </TabsContent>

        <TabsContent value="friends" className="space-y-4">
          <FriendsList active={activeTab === "friends"} />
        </TabsContent>
      </Tabs>
      
      <SearchUserDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </div>
  );
}
"use client";

import FriendsList from "@/components/friend/FriendsList";

export default function FriendPage() {
  return (
    <div className="animate-in fade-in-50 duration-300 w-full h-full p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Members</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-muted-foreground">Review all members</span>
        </div>
      </div>
      <FriendsList active={true} />
    </div>
  );
}
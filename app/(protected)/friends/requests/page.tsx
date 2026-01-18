"use client";

import { useState } from "react";
import FriendRequestList from "@/features/friend/components/FriendRequestList";

export default function RequestsPage() {
    const [requestType, setRequestType] = useState<"received" | "sent">("received");

    return (
        <div className="space-y-6 animate-in fade-in-50 duration-300 w-full max-w-5xl mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Friend Requests</h1>
                    <p className="text-muted-foreground mt-1">Manage your connections and pending invites</p>
                </div>
                <div className="inline-flex p-1 bg-muted rounded-lg">
                    <button
                        onClick={() => setRequestType("received")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${requestType === "received" ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50 text-muted-foreground"}`}
                    >
                        Received
                    </button>
                    <button
                        onClick={() => setRequestType("sent")}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${requestType === "sent" ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50 text-muted-foreground"}`}
                    >
                        Sent
                    </button>
                </div>
            </div>
            <FriendRequestList active={true} type={requestType} />
        </div>
    );
}

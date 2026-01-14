"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useFriendRequests, useAcceptFriendRequest, useRejectFriendRequest } from "@/hooks/friend/useFriendRequests";
import { Loader2, Check, X } from "lucide-react";
import { useState } from "react";
import { User } from "@/types/user";

interface FriendRequestItem {
  _id: string;
  user: User;
  status: string;
  createdAt: string;
}

export default function FriendRequestList({ active }: { active: boolean }) {
  const { data, isLoading } = useFriendRequests(active);
  

  
  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();
  
  const [processingId, setProcessingId] = useState<string | null>(null);

  const receivedRequests: FriendRequestItem[] = data?.received?.data ?? [];


  if (!active) {
    return null;
  }

  const handleAccept = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await acceptMutation.mutateAsync(requestId);
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await rejectMutation.mutateAsync(requestId);
    } catch (error) {
      console.error("Failed to reject friend request:", error);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (receivedRequests.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No pending friend requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {receivedRequests.map((request) => {
        const isProcessing = processingId === request._id;
        const user = request.user;

        return (
          <div
            key={request._id}
            className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.username}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-semibold">
                  {user.username?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user.username}</p>
              {user.email && (
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              )}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                onClick={() => handleAccept(request._id)}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing && acceptMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(request._id)}
                disabled={isProcessing}
                className="gap-2"
              >
                {isProcessing && rejectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Reject
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}


"use client";

import { Button } from "@/components/ui/button";
import { useFriendRequests, useAcceptFriendRequest, useRejectFriendRequest } from "@/features/friend/hooks/useFriendRequests";
import { useCancelFriendRequest } from "@/features/friend/hooks/useCancelFriendRequest";
import { Loader2, Check, X, Ban } from "lucide-react";
import { useState } from "react";
import { User } from "@/types/user";
import { UserItem } from "@/components/shared/UserItem";

interface FriendRequestItem {
  _id: string;
  from: User | string;
  to: User | string;
  status: string;
  createdAt: string;
}

interface FriendRequestListProps {
  active: boolean;
  type?: "received" | "sent";
}

export default function FriendRequestList({ active, type = "received" }: FriendRequestListProps) {
  const { data, isLoading } = useFriendRequests(active);

  const acceptMutation = useAcceptFriendRequest();
  const rejectMutation = useRejectFriendRequest();
  const cancelMutation = useCancelFriendRequest();

  const [processingId, setProcessingId] = useState<string | null>(null);

  const requests: FriendRequestItem[] = type === "received"
    ? (data?.received ?? [])
    : (data?.sent ?? []);

  if (!active) {
    return null;
  }

  const handleAccept = async (requestId: string, userId: string) => {
    setProcessingId(requestId);
    try {
      await acceptMutation.mutateAsync({ requestId, userId });
    } catch (error) {
      console.error("Failed to accept:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string, userId: string) => {
    setProcessingId(requestId);
    try {
      await rejectMutation.mutateAsync({ requestId, userId });
    } catch (error) {
      console.error("Failed to reject:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (requestId: string, userId: string) => {
    setProcessingId(requestId);
    try {
      await cancelMutation.mutateAsync({ requestId, userId });
    } catch (error) {
      console.error("Failed to cancel:", error);
    } finally {
      setProcessingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No {type} requests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const isProcessing = processingId === request._id;
        // received: from is User, to is ID
        // sent: to is User, from is ID
        const displayUser = (type === "received" ? request.from : request.to) as User;

        if (!displayUser || typeof displayUser === 'string') return null;

        const renderSubText = () => (
          <span className="text-xs text-muted-foreground">
            {type === 'received' ? 'Sent request' : 'Request sent'} • {new Date(request.createdAt).toLocaleDateString()}
          </span>
        );

        const renderActions = () => (
          <div className="flex gap-2 flex-shrink-0">
            {type === "received" ? (
              <>
                <Button
                  size="sm"
                  onClick={() => handleAccept(request._id, displayUser._id)}
                  disabled={isProcessing}
                  className="gap-2 rounded-full"
                >
                  {isProcessing && acceptMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleReject(request._id, displayUser._id)}
                  disabled={isProcessing}
                  className="gap-2 rounded-full"
                >
                  {isProcessing && rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  Reject
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleCancel(request._id, displayUser._id)}
                disabled={isProcessing}
                className="gap-2 rounded-full"
              >
                {isProcessing && cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                Cancel
              </Button>
            )}
          </div>
        );

        return (
          <UserItem
            key={request._id}
            user={displayUser}
            subText={renderSubText()}
            actions={renderActions()}
            className="border bg-card shadow-sm cursor-default hover:bg-card"
          />
        );
      })}
    </div>
  );
}

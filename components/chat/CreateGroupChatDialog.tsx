"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFriends } from "@/hooks/friend/useFriends";
import { Loader2, Check } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/user";
import { useSocketStore } from "@/stores/useSocketStore";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { SOCKET_EVENTS } from "@/constants/socket";
import { Conversation } from "@/types/conversation";

interface CreateGroupChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateGroupChatDialog({
  open,
  onOpenChange,
}: CreateGroupChatDialogProps) {
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState("");
  const { data, isLoading } = useFriends(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const emitAsync = useSocketStore((state) => state.emitAsync);

  const friends: User[] = data?.pages.flatMap((page) => page.data) ?? [];

  const createMutation = useMutation({
    mutationFn: (data: {
      type: "group";
      name: string;
      memberIds: string[];
    }) => emitAsync("create_conversation", data), // Note: create_conversation should be in constants
    onSuccess: (conversation: Conversation) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONVERSATIONS] });
      onOpenChange(false);
      setGroupName("");
      setSelectedFriends(new Set());
      router.push(`/${conversation._id}`);
    },
  });

  const toggleFriendSelection = (friendId: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedFriends.size === 0) {
      return;
    }

    createMutation.mutate({
      type: "group",
      name: groupName.trim(),
      memberIds: Array.from(selectedFriends),
    });
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      onOpenChange(false);
      setGroupName("");
      setSelectedFriends(new Set());
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
          <DialogDescription>
            Select friends to add to the group chat
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={createMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>Select Friends ({selectedFriends.size} selected)</Label>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : friends.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No friends available
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-lg p-2">
                {friends.map((friend) => {
                  const isSelected = selectedFriends.has(friend._id);

                  return (
                    <div
                      key={friend._id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary/10 border border-primary"
                          : "hover:bg-accent border border-transparent"
                      }`}
                      onClick={() => toggleFriendSelection(friend._id)}
                    >
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {friend.avatar ? (
                          <Image
                            src={friend.avatar}
                            alt={friend.username}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground font-semibold text-sm">
                            {friend.username?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{friend.username}</p>
                        {friend.email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {friend.email}
                          </p>
                        )}
                      </div>

                      {isSelected && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              !groupName.trim() ||
              selectedFriends.size === 0 ||
              createMutation.isPending
            }
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Group"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


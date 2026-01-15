"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchUsers } from "@/hooks/user/useSearchUsers";
import { useDebounce } from "@/hooks/shared/useDebounce";
import { Loader2, UserPlus, Search, Check, Clock, X, UserMinus } from "lucide-react";
import { UserProfileDialog } from "@/components/user";
import { useSendFriendRequest, useCancelFriendRequest, useUnfriend } from "@/hooks/friend";
import { UserItem } from "@/components/shared/UserItem";

export default function SearchUser() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { data, isLoading } = useSearchUsers(debouncedSearch);
    const [openUserProfileDialog, setOpenUserProfileDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [pendingUserId, setPendingUserId] = useState<string | null>(null);

    const handleOpenUserProfileDialog = (user: any) => {
        setSelectedUser(user);
        setOpenUserProfileDialog(true);
    };

    const users = data?.pages.flatMap((page) => page?.data ?? []) ?? [];

    const sendRequestMutation = useSendFriendRequest();
    const cancelRequestMutation = useCancelFriendRequest();
    const unfriendMutation = useUnfriend();

    const handleSendRequest = (userId: string) => {
        setPendingUserId(userId);
        sendRequestMutation.mutate(userId, {
            onSettled: () => {
                setPendingUserId(null);
            }
        });
    };

    const handleCancelRequest = (requestId: string, userId: string) => {
        setPendingUserId(userId);
        cancelRequestMutation.mutate(requestId, {
            onSettled: () => {
                setPendingUserId(null);
            }
        });
    };

    const handleUnfriend = (friendId: string) => {
        setPendingUserId(friendId);
        unfriendMutation.mutate(friendId, {
            onSettled: () => {
                setPendingUserId(null);
            }
        });
    };

    return (
        <>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Find users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10 rounded-full bg-muted/50 border-transparent focus:bg-background focus:border-input transition-colors"
                    autoFocus
                />
            </div>

            <div className="mt-6 space-y-2">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : users.length > 0 ? (
                    users.map(user => {
                        const isPending = pendingUserId === user._id;

                        const renderActions = () => {
                            if (user.relationship === 'friend') {
                                return (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnfriend(user._id);
                                        }}
                                        disabled={isPending}
                                        className="min-w-[100px] rounded-full"
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserMinus className="h-4 w-4 mr-2" /> Unfriend</>}
                                    </Button>
                                );
                            }
                            if (user.relationship === 'request_sent') {
                                return (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            user.friendRequestId && handleCancelRequest(user.friendRequestId, user._id);
                                        }}
                                        disabled={isPending}
                                        className="min-w-[100px] rounded-full"
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><X className="h-4 w-4 mr-2" /> Cancel</>}
                                    </Button>
                                );
                            }
                            if (user.relationship === 'request_received') {
                                return (
                                    <Button size="sm" variant="secondary" disabled className="min-w-[100px] rounded-full">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Pending
                                    </Button>
                                );
                            }

                            // relationship === 'none' or undefined
                            return (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSendRequest(user._id);
                                    }}
                                    disabled={isPending}
                                    className="min-w-[100px] rounded-full"
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4 mr-2" /> Add Friend</>}
                                </Button>
                            );
                        };

                        return (
                            <UserItem
                                key={user._id}
                                user={user}
                                onClick={() => handleOpenUserProfileDialog(user)}
                                actions={renderActions()}
                                className="bg-card border hover:border-primary/50 transition-colors"
                            />
                        );
                    })
                ) : debouncedSearch ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No users found matching "{searchTerm}"</p>
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Type to search for people</p>
                    </div>
                )}
            </div>
            <UserProfileDialog open={openUserProfileDialog} onOpenChange={setOpenUserProfileDialog} user={selectedUser} />
        </>
    );
}

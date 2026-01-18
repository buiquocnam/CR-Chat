"use client";

import { useConversationMembers } from "@/features/chat/hooks/useConversations";
import { useSendFriendRequest } from "@/features/friend/hooks/useSendFriendRequest";
import { useAcceptFriendRequest } from "@/features/friend/hooks/useFriendRequests";
import { useUnfriend } from "@/features/friend/hooks/useUnfriend";
import { useAuthStore } from "@/stores/useAuthStore";
import { conversationService } from "@/features/chat/services/conversationService";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { User } from "@/types/user";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserItem } from "@/components/shared/UserItem";
import {
    Users,
    MessageSquare,
    UserPlus,
    UserCheck,
    UserMinus,
    Clock,
    Loader2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConversationMembersDialogProps {
    conversationId: string;
}

export function ConversationMembersDialog({ conversationId }: ConversationMembersDialogProps) {
    const [open, setOpen] = useState(false);
    const { user: currentUser } = useAuthStore();
    const router = useRouter();

    // Hooks
    const { data: members, isLoading } = useConversationMembers(conversationId, open);
    const { mutate: sendRequest, isPending: isSending } = useSendFriendRequest();
    const { mutate: acceptRequest, isPending: isAccepting } = useAcceptFriendRequest();
    const { mutate: unfriend, isPending: isUnfriending } = useUnfriend();

    const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

    const handleChat = async (userId: string) => {
        setLoadingActionId(userId);
        try {
            const conv = await conversationService.createPrivateConversation(userId);
            router.push(`/${conv._id}`);
            setOpen(false);
        } catch (error) {
            toast.error("Không thể mở cuộc trò chuyện");
        } finally {
            setLoadingActionId(null);
        }
    };

    const handleAction = async (action: () => Promise<any> | void, userId: string) => {
        setLoadingActionId(userId);
        try {
            await action();
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingActionId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Thành viên nhóm">
                    <Users className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thành viên nhóm ({members?.length || 0})</DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[400px] pr-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-20">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {members?.map((member: any) => {
                                const user: User = member.user || member.userId;
                                const isMe = user._id === currentUser?._id;
                                const isActionLoading = loadingActionId === user._id;

                                const renderActions = () => {
                                    if (isMe) return <span className="text-xs text-muted-foreground px-2">Bạn</span>;

                                    return (
                                        <>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                onClick={() => handleChat(user._id)}
                                                disabled={isActionLoading}
                                                title="Nhắn tin"
                                            >
                                                {isActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                                            </Button>

                                            {user.relationship === 'friend' && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100">
                                                            <UserCheck className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive cursor-pointer"
                                                            onClick={() => handleAction(() => unfriend(user._id), user._id)}
                                                        >
                                                            <UserMinus className="h-4 w-4 mr-2" />
                                                            Huỷ kết bạn
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}

                                            {user.relationship === 'none' && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => handleAction(() => sendRequest(user._id), user._id)}
                                                    disabled={isActionLoading}
                                                    title="Kết bạn"
                                                >
                                                    <UserPlus className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {user.relationship === 'request_sent' && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-muted-foreground cursor-default"
                                                    disabled
                                                    title="Đã gửi lời mời"
                                                >
                                                    <Clock className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {user.relationship === 'request_received' && user.friendRequestId && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                                    onClick={() => handleAction(() => acceptRequest(user.friendRequestId!), user._id)}
                                                    disabled={isActionLoading}
                                                    title="Chấp nhận kết bạn"
                                                >
                                                    <UserCheck className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </>
                                    );
                                };

                                return (
                                    <UserItem
                                        key={user._id}
                                        user={user}
                                        subText={member.role === 'admin' ? 'Quản trị viên' : undefined}
                                        actions={renderActions()}
                                    />
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

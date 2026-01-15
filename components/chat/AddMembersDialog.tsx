"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAddMembers } from "@/hooks/chat/useAddMembers";
import { useSearchUsers } from "@/hooks/user/useSearchUsers";
import { Check, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/shared/useDebounce";

interface AddMembersDialogProps {
    conversationId: string;
}

export function AddMembersDialog({ conversationId }: AddMembersDialogProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const debouncedQuery = useDebounce(query, 300);
    const { data: searchResults } = useSearchUsers(debouncedQuery);
    const { mutate: addMembers, isPending } = useAddMembers();

    const handleSelectUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSubmit = () => {
        if (selectedUsers.length === 0) return;

        addMembers(
            {
                conversationId,
                memberIds: selectedUsers,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    setSelectedUsers([]);
                    setQuery("");
                },
            }
        );
    };

    const users = searchResults?.pages.flatMap((page) => page.data) || [];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Thêm thành viên">
                    <UserPlus className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thêm thành viên</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <Input
                        placeholder="Tìm kiếm người dùng..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />

                    <ScrollArea className="h-[200px] border rounded-md p-2">
                        {users.map((user) => (
                            <div
                                key={user._id}
                                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted ${selectedUsers.includes(user._id) ? "bg-muted" : ""
                                    }`}
                                onClick={() => handleSelectUser(user._id)}
                            >
                                <Avatar>
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>{user.username[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-medium">{user.username}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                {selectedUsers.includes(user._id) && (
                                    <Check className="h-4 w-4 text-primary" />
                                )}
                            </div>
                        ))}
                    </ScrollArea>
                </div>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isPending || selectedUsers.length === 0}>
                        {isPending ? "Đang thêm..." : "Thêm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

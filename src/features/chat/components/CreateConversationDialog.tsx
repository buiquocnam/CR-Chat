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
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useSearchUsers } from "@/features/user/hooks/useSearchUsers";
import { useSocketStore } from "@/stores/useSocketStore";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { Check, Plus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/useDebounce";

export function CreateConversationDialog() {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<"direct" | "group">("direct");
    const [name, setName] = useState("");
    const [query, setQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const debouncedQuery = useDebounce(query, 300);
    const { data: searchResults } = useSearchUsers(debouncedQuery);
    const emitAsync = useSocketStore((state) => state.emitAsync);
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();

    const handleSelectUser = (userId: string) => {
        if (type === "direct") {
            setSelectedUsers([userId]);
        } else {
            if (selectedUsers.includes(userId)) {
                setSelectedUsers(selectedUsers.filter((id) => id !== userId));
            } else {
                setSelectedUsers([...selectedUsers, userId]);
            }
        }
    };

    const handleSubmit = async () => {
        if (selectedUsers.length === 0) return;

        try {
            setIsPending(true);
            const conversation = await emitAsync("create_conversation", {
                type,
                memberIds: selectedUsers,
                name: type === "group" ? name : undefined,
            });

            // Invalidate conversations list locally although socket event should handle it if listening
            // But confirming via query invalidation is safe
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONVERSATIONS] });

            setOpen(false);
            setSelectedUsers([]);
            setName("");
            setQuery("");

            router.push(`/${conversation._id}`);
        } catch (error: any) {
            toast.error(error?.message || "Không thể tạo cuộc trò chuyện");
        } finally {
            setIsPending(false);
        }
    };

    const users = searchResults?.pages.flatMap((page) => page.data) || [];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Tạo cuộc trò chuyện mới</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="direct" onValueChange={(v) => {
                    setType(v as "direct" | "group");
                    setSelectedUsers([]);
                }}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="direct">Cá nhân</TabsTrigger>
                        <TabsTrigger value="group">Nhóm</TabsTrigger>
                    </TabsList>

                    <div className="py-4 space-y-4">
                        {type === "group" && (
                            <div className="grid gap-2">
                                <Label htmlFor="name">Tên nhóm</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập tên nhóm..."
                                />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>Thành viên</Label>
                            <Input
                                placeholder="Tìm kiếm người dùng..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>

                        {selectedUsers.length > 0 && type === "group" && (
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map(userId => (
                                    <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                                        {userId.slice(0, 4)}...
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => handleSelectUser(userId)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <ScrollArea className="h-[200px] border rounded-md p-2">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted ${selectedUsers.includes(user._id) ? "bg-muted" : ""
                                        }`}
                                    onClick={() => handleSelectUser(user._id)}
                                >
                                    <Avatar>
                                        <AvatarImage src={user.avatarUrl} />
                                        <AvatarFallback>{(user.displayName || user.username)[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-medium">{user.displayName || user.username}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                    {selectedUsers.includes(user._id) && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                </Tabs>

                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isPending || selectedUsers.length === 0 || (type === 'group' && !name)}>
                        {isPending ? "Đang tạo..." : "Tạo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

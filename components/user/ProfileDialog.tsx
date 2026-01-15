"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUpdateProfile } from "@/hooks/user/useUpdateProfile";
import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function ProfileDialog() {
    const { user } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState(user?.username || "");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutate: updateProfile, isPending } = useUpdateProfile();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const url = URL.createObjectURL(file);
            setPreview(url);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile(
            { username, avatar: file || undefined },
            {
                onSuccess: () => {
                    setOpen(false);
                    setFile(null);
                    setPreview(null);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden">
                            <Avatar className="h-full w-full">
                                <AvatarImage src={user?.avatar} alt={user?.username} className="object-cover" />
                                <AvatarFallback className="text-sm font-medium">{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">Profile</TooltipContent>
            </Tooltip>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Hồ sơ người dùng</DialogTitle>
                    <DialogDescription>
                        Xem và chỉnh sửa thông tin cá nhân của bạn.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col items-center gap-4">
                            <div
                                className="relative cursor-pointer group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={preview || user?.avatar} className="object-cover" />
                                    <AvatarFallback className="text-xl">
                                        {user?.username?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white h-8 w-8" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <Label className="text-xs text-muted-foreground">Nhấn để thay đổi ảnh đại diện</Label>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                                Username
                            </Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

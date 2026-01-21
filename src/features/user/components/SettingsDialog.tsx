"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface SettingsDialogProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function SettingsDialog({ trigger, open, onOpenChange }: SettingsDialogProps) {
    const { theme, setTheme } = useTheme();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Cài đặt</DialogTitle>
                    <DialogDescription>
                        Quản lý giao diện và tùy chọn ứng dụng.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium">Giao diện</h3>
                            <p className="text-sm text-muted-foreground">
                                Tùy chỉnh giao diện sáng/tối và độ sáng màn hình.
                            </p>
                        </div>

                        <div className="grid gap-4">
                            <Label>Chế độ hiển thị</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-24 flex flex-col items-center justify-center gap-2 border-2",
                                        theme === "light" ? "border-primary bg-primary/5" : "border-transparent"
                                    )}
                                    onClick={() => setTheme("light")}
                                >
                                    <Sun className="h-6 w-6" />
                                    <span>Sáng</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-24 flex flex-col items-center justify-center gap-2 border-2",
                                        theme === "dark" ? "border-primary bg-primary/5" : "border-transparent"
                                    )}
                                    onClick={() => setTheme("dark")}
                                >
                                    <Moon className="h-6 w-6" />
                                    <span>Tối</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-24 flex flex-col items-center justify-center gap-2 border-2",
                                        theme === "system" ? "border-primary bg-primary/5" : "border-transparent"
                                    )}
                                    onClick={() => setTheme("system")}
                                >
                                    <Laptop className="h-6 w-6" />
                                    <span>Hệ thống</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helper Button component simple version to avoid circular deps if needed, 
// strictly we should import from ui/button but for speed I used standard Button logic inside or imported.
import { Button } from "@/components/ui/button";

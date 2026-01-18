"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface LogoutButtonProps extends React.ComponentProps<typeof Button> {
    showLabel?: boolean;
}

export function LogoutButton({ className, showLabel = true, ...props }: LogoutButtonProps) {
    const { mutate: logout, isPending } = useLogout();

    const button = (
        <Button
            variant="ghost"
            className={cn(
                "justify-start gap-2",
                !showLabel && "justify-center h-10 w-10 p-0 rounded-xl hover:bg-muted text-muted-foreground",
                className
            )}
            onClick={() => logout()}
            disabled={isPending}
            {...props}
        >
            <LogOut className={cn("h-5 w-5", showLabel && "h-4 w-4")} />
            {showLabel && <span>{isPending ? "Đang đăng xuất..." : "Đăng xuất"}</span>}
        </Button>
    );

    if (showLabel) return button;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {button}
            </TooltipTrigger>
            <TooltipContent side="right">Log out</TooltipContent>
        </Tooltip>
    )
}

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User } from "@/types/user";

interface UserItemProps {
    user: Partial<User>;
    actions?: React.ReactNode;
    className?: string;
    onClick?: () => void;
    subText?: React.ReactNode;
}

export function UserItem({ user, actions, className, onClick, subText }: UserItemProps) {
    return (
        <div
            className={cn("flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group", className)}
            onClick={onClick}
        >
            <div className="relative flex-shrink-0">
                <Avatar>
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback>{(user.displayName || user.username)?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                {user.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.displayName || user.username}</p>
                <div className="text-sm text-muted-foreground truncate">
                    {subText || user.email}
                </div>
            </div>

            {actions && (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {actions}
                </div>
            )}
        </div>
    );
}

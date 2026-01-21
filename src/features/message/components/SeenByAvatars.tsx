import { User } from "@/types/user";
import Image from "next/image";
import { memo } from "react";

interface SeenByAvatarsProps {
    seenBy?: User[];
}

export const SeenByAvatars = memo(({ seenBy }: SeenByAvatarsProps) => {
    if (!seenBy || seenBy.length === 0) return null;

    const uniqueSeenBy = seenBy.filter((user, index, self) =>
        index === self.findIndex((t) => t._id === user._id)
    );

    const displayUsers = uniqueSeenBy.slice(0, 3);
    const remaining = uniqueSeenBy.length - 3;

    return (
        <div className="flex items-center -space-x-2 mt-1 justify-end">
            {displayUsers.map((user) => (
                <div key={user._id} className="w-4 h-4 rounded-full border border-background relative overflow-hidden" title={user.displayName || user.username}>
                    {user.avatarUrl ? (
                        <Image src={user.avatarUrl} alt={user.displayName || user.username} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-[8px] font-bold">
                            {(user.displayName || user.username)?.[0]?.toUpperCase()}
                        </div>
                    )}
                </div>
            ))}
            {remaining > 0 && (
                <div className="w-4 h-4 rounded-full border border-background bg-muted flex items-center justify-center text-[8px] font-medium z-10">
                    +{remaining}
                </div>
            )}
        </div>
    );
});

SeenByAvatars.displayName = "SeenByAvatars";

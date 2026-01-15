"use client";

export default function FriendsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full flex flex-col bg-background">
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
}

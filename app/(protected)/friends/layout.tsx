"use client";

export default function FriendsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full w-full flex flex-col bg-transparent">
            {children}
        </div>
    );
}

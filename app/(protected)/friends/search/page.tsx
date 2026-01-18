"use client";

import SearchUser from "@/features/user/components/SearchUser";

export default function SearchPage() {
    return (
        <div className="animate-in fade-in-50 duration-300 max-w-3xl mx-auto w-full p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Find and Add Friends</h1>
                <p className="text-muted-foreground mt-1">Connect with people you know or find new interests.</p>
            </div>
            <SearchUser />
        </div>
    );
}

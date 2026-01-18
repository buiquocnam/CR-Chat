"use client";

import { ReactNode } from "react";

interface ChatWindowLayoutProps {
  children: ReactNode;
}

export default function ChatWindowLayout({ children }: ChatWindowLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      {children}
    </div>
  );
}


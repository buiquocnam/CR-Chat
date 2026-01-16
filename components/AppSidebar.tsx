"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { MessageCircle, Users, UserPlus, Compass } from "lucide-react"
import { LogoutButton } from "@/components/auth/LogoutButton";
import Link from "next/link";
import { ProfileDialog } from "@/components/user/ProfileDialog";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";


const items = [
  {
    title: "All Chats",
    url: "/",
    icon: MessageCircle,
    isActive: (pathname: string) => pathname === "/" || pathname.startsWith("/c/"),
  },
  {
    title: "Friends",
    url: "/friends",
    icon: Users,
    isActive: (pathname: string) => pathname === "/friends",
  },
  {
    title: "Requests",
    url: "/friends/requests",
    icon: UserPlus,
    isActive: (pathname: string) => pathname === "/friends/requests",
  },
  {
    title: "Discover",
    url: "/friends/search",
    icon: Compass,
    isActive: (pathname: string) => pathname === "/friends/search",
  },
]

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col h-full items-center py-6 gap-6 w-full">
      {/* Brand Icon */}
      <div className="w-10 h-10 bg-white/50 text-primary rounded-[14px] flex items-center justify-center font-bold text-xl backdrop-blur-md shadow-sm ring-1 ring-black/5 mb-2 hover:scale-105 transition-transform cursor-pointer">
        M
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col gap-3 w-full px-3">
        {items.map((item) => {
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.title}
              href={item.url}
              className={cn(
                "w-full aspect-square flex items-center justify-center rounded-[18px] transition-all duration-300 group relative",
                active
                  ? "bg-white text-primary shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] ring-1 ring-black/5 scale-105"
                  : "text-muted-foreground/60 hover:bg-black/5 hover:text-foreground"
              )}
              title={item.title}
            >
              <item.icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 h-3 w-1 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Items */}
      <div className="flex flex-col gap-4 items-center px-3 w-full pb-2">
        <ProfileDialog />
        <LogoutButton showLabel={false} className="w-full aspect-square p-0 rounded-[18px] flex items-center justify-center text-muted-foreground/60 hover:bg-black/5 hover:text-destructive transition-colors" />
      </div>
    </nav>
  );
}

function AppSidebarFooter() {
  return null;
}
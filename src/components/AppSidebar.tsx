"use client"

import {
  Sidebar,
  SidebarContent,
} from "@/components/ui/sidebar"
import { MessageCircle, Users, UserPlus, Compass, Settings } from "lucide-react"
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { ModeToggle } from "@/components/shared/ModeToggle";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { ProfileDialog } from "@/features/user/components/ProfileDialog";
import { usePathname } from "next/navigation";
import { SettingsDialog } from "@/features/user/components/SettingsDialog";

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
  const { user } = useAuthStore(); // Needed for user info

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "w-[260px] hidden md:flex",
        "border-r border-border bg-sidebar/80 backdrop-blur-xl",
        "flex flex-col h-screen transition-colors duration-300"
      )}
    >
      <SidebarContent>
        <nav className="flex flex-col h-full py-4 gap-2 w-full px-2">
          {/* Brand & User Info Header (Optional, or keep clean) */}
          <div className="flex items-center gap-3 px-2 py-2 mb-4">
            <div className="w-10 h-10 bg-sidebar-primary text-sidebar-primary-foreground rounded-xl flex items-center justify-center font-bold text-xl shadow-sm ring-1 ring-border">
              M
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold truncate text-sm">{user?.displayName || "User"}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.username || user?.email}</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 flex flex-col gap-1 w-full">
            {items.map((item) => {
              const active = item.isActive(pathname);
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                  title={item.title}
                >
                  <item.icon className={cn("w-5 h-5", active && "text-primary")} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-sm">{item.title}</span>
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 bg-primary rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer Items */}
          <div className="mt-auto flex flex-col gap-2 px-2 pb-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 overflow-hidden">
                <ProfileDialog /> {/* Use ProfileDialog trigger which is the Avatar */}
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-medium truncate">{user?.displayName}</span>
                  <span className="text-[10px] text-muted-foreground truncate opacity-70">Online</span>
                </div>
              </div>
              <SettingsDialog
                trigger={<Settings className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />}
              />
            </div>

            <div className="w-full">
              <LogoutButton showLabel={true} className="w-full justify-start px-3 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10" />
            </div>
          </div>
        </nav>
      </SidebarContent>
    </Sidebar >
  );
}
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
    <>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="flex justify-center items-center py-4">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-xl group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:text-lg">
            M
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="gap-2 px-2">
            {items.map((item) => {
              const active = item.isActive(pathname);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.title}
                    className={cn(
                      "h-12 w-full justify-start rounded-xl transition-all duration-200 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center",
                      active ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:text-primary-foreground" : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="!w-6 !h-6 group-data-[collapsible=icon]:!w-5 group-data-[collapsible=icon]:!h-5" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 gap-4 flex flex-col items-center pb-4">
          <ProfileDialog />
          <AppSidebarFooter />
        </SidebarFooter>
      </Sidebar>

    </>
  )
}

function AppSidebarFooter() {
  const { state } = useSidebar();
  return <LogoutButton showLabel={state !== "collapsed"} className={cn(state === "collapsed" && "h-10 w-10 p-0 rounded-xl")} />
}
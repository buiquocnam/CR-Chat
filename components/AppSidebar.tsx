"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
  } from "@/components/ui/sidebar"
import { Inbox, LogOut, Search, Settings, MessageCircle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/stores/useAuthStore"
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSocketStore } from "@/stores/useSocketStore"
import { Socket } from "socket.io-client";
import { useState } from "react";
import CreateGroupChatDialog from "@/components/chat/CreateGroupChatDialog";

const items = [
    {
      title: "Message",
      url: "/",
      icon: MessageCircle,
    },
    {
      title: "Friends",
      url: "/friends",
      icon: Inbox,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ] 

  export function AppSidebar() {
    const { clear } = useAuthStore();
    const router = useRouter();
    const  socket  = useSocketStore((s) => s.socket);
    const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);

    const handleSignOut = async () => {
        await authService.signOut();
        (socket as Socket).disconnect();
        clear();
        router.push("/login");
    };

    return (
      <Sidebar collapsible="icon" >
        <SidebarHeader className="border-b flex justify-between items-center p-4">
            <h1 className="text-2xl font-bold text-center">Moji</h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setIsCreateGroupDialogOpen(true)}>
                    <Users />
                    <span>Create Group</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
          <SidebarFooter>
            <Button variant="outline" size="icon" className="w-full" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                Logout
            </Button>
            </SidebarFooter>
      <CreateGroupChatDialog
        open={isCreateGroupDialogOpen}
        onOpenChange={setIsCreateGroupDialogOpen}
      />
      </Sidebar>
    )
  }
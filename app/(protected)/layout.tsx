import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { SocketProvider } from "@/components/providers/SocketProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SocketProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-svh w-full overflow-hidden">
          <AppSidebar />
          <SidebarInset>
            <div className="flex h-full w-full overflow-hidden">
              {/* ChatSidebar removed, now handled by AppSidebar */}
              <main className="flex-1 min-w-0 h-full overflow-hidden bg-background">
                {children}
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </SocketProvider>
  );
}

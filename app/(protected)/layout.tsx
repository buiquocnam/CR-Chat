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
        <div className="relative flex h-screen w-full overflow-hidden bg-background">
          {/* Fullscreen Container - No rounded corners, no padding */}
          <div className="flex h-full w-full overflow-hidden bg-white/30 backdrop-blur-2xl">

            {/* Slim Sidebar (Icon Only) */}
            <div className="hidden md:block w-[72px] lg:w-[80px] h-full flex-shrink-0 border-r border-black/5 bg-white/40 backdrop-blur-xl z-20">
              <AppSidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex min-w-0 h-full overflow-hidden relative">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </SocketProvider>
  );
}

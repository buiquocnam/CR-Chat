import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SocketProvider } from "@/providers/SocketProvider";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SocketProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="relative flex h-screen w-full overflow-hidden bg-background">
          <div className="flex h-full w-full overflow-hidden bg-white/30 backdrop-blur-2xl">
            <AppSidebar />

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

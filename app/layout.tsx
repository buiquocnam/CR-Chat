import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import ReactQueryProvider from "@/providers/ReactQueryProvider"
import { AuthProvider } from "@/providers"

export const metadata: Metadata = {
  title: "Moji",
  description: "Moji is a real-time chat application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 

  return (
    <html lang="vi">
      <body
        className="antialiased" 
      >
          <AuthProvider>
            <ReactQueryProvider>
                <main className="w-full">
                {children}
                </main>
              </ReactQueryProvider>
          </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

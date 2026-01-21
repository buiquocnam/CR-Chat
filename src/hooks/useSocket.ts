"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";

export const useSocket = () => {
  const { accessToken } = useAuthStore();
  const isInitializing = useRef(false);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    // Check socket từ store (không đưa vào deps để tránh loop)
    const currentSocket = useSocketStore.getState().socket;
    if (currentSocket?.connected) {
      return;
    }

    // Prevent multiple initializations
    if (isInitializing.current) {
      return;
    }

    const init = async () => {
      isInitializing.current = true;
      
      try {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
        const s = io(socketUrl, {
          auth: { token: accessToken },
          transports: ["websocket"],
        });
        
        useSocketStore.getState().setSocket(s);
        
        s.onAny((event, ...args) => {
          console.log("Socket event:", event, args);
        });
        
        s.on("connect", () => {
          console.log("Socket connected:", s.id);
          useSocketStore.getState().setIsConnected(true);
          isInitializing.current = false;
        });
        
        s.on("disconnect", () => {
          console.log("Socket disconnected");
          useSocketStore.getState().setIsConnected(false);
          isInitializing.current = false;
        });

        s.on("connect_error", async (err) => {
          console.error("Socket connect_error:", err.message);
          isInitializing.current = false; // Allow retries

          if (err.message.includes("Unauthorized") || err.message.includes("jwt expired")) {
            try {
              // Try to refresh token
              const { authService } = await import("@/features/auth/services/authService");
              const newToken = await authService.refresh();
              
              if (newToken) {
                 useAuthStore.getState().setAccessToken(newToken);
                 // The useEffect will re-run because accessToken changed
              }
            } catch (refreshErr) {
               console.error("Socket refresh token failed", refreshErr);
               // Force logout if refresh fails
               useAuthStore.getState().clear();
            }
          }
        });

      } catch (err) {
        console.error(err);
        isInitializing.current = false;
      }
    };

    init();

    // Cleanup khi unmount / logout
    return () => {
      const currentSocket = useSocketStore.getState().socket;
      if (currentSocket) {
        currentSocket.disconnect(); 
        useSocketStore.getState().setSocket(null);
      }
      isInitializing.current = false;
    };
  }, [accessToken]);
};
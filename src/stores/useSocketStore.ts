// src/store/useSocketStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Socket } from "socket.io-client";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  setSocket: (socket: Socket | null) => void;
  setIsConnected: (isConnected: boolean) => void;
  emitAsync: <T = any>(event: string, data: any) => Promise<T>;
}

export const useSocketStore = create<SocketState>()(
  devtools((set, get) => ({
    socket: null,
    isConnected: false,
    setSocket: (socket) => set({ socket }),
    setIsConnected: (isConnected) => set({ isConnected }),
    emitAsync: (event, data) => {
      const { socket } = get();
      return new Promise((resolve, reject) => {
        if (!socket) return reject(new Error("Socket not connected"));
        
        // Set timeout to 10 seconds
        const timeout = setTimeout(() => {
          reject(new Error(`Event ${event} timed out`));
        }, 10000);

        socket.emit(event, data, (response: any) => {
          clearTimeout(timeout);
          if (response.status === "ok") {
            resolve(response.data);
          } else {
            reject(new Error(response.message || "Socket action failed"));
          }
        });
      });
    },
  }))
);

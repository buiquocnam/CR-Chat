"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User } from "@/types/user";
import Image from "next/image";

interface UserProfileDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserProfileDialog({ user, open, onOpenChange }: UserProfileDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Thông tin người dùng</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.displayName} fill className="object-cover" />
            ) : (
              <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.displayName} fill className="object-cover" />
            )}
          </div>

          <div className="text-center">
            <h3 className="font-bold text-lg">{user.displayName || user.username}</h3>
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="text-xs text-muted-foreground">@{user.username}</p>
              {user.isOnline ? (
                <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Trực tuyến
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground italic">
                  Ngoại tuyến
                </span>
              )}
            </div>

            {user.bio && <p className="text-sm mt-3 font-medium max-w-[280px] mx-auto text-foreground/80 leading-relaxed">{user.bio}</p>}

            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted-foreground w-full bg-muted/40 p-4 rounded-xl border border-border/50">
              <div className="flex flex-col gap-1 items-start px-1">
                <span className="font-bold text-[10px] uppercase text-foreground/60 tracking-wider">Email</span>
                <span className="truncate max-w-full font-medium text-foreground/90" title={user.email}>{user.email}</span>
              </div>
              <div className="flex flex-col gap-1 items-start border-l border-border/50 pl-3 px-1">
                <span className="font-bold text-[10px] uppercase text-foreground/60 tracking-wider">Tham gia</span>
                <span className="font-medium text-foreground/90">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '---'}</span>
              </div>

              {user.phone && (
                <div className="flex flex-col gap-1 items-start col-span-2 border-t border-border/50 mt-2 pt-3 px-1">
                  <span className="font-bold text-[10px] uppercase text-foreground/60 tracking-wider">Điện thoại</span>
                  <span className="font-medium text-foreground/90">{user.phone}</span>
                </div>
              )}

              {user.lastSeen && !user.isOnline && (
                <div className="flex flex-col gap-1 items-start col-span-2 border-t border-border/50 mt-2 pt-3 px-1">
                  <span className="font-bold text-[10px] uppercase text-foreground/60 tracking-wider">Hoạt động cuối</span>
                  <span className="font-medium text-foreground/90">
                    {new Date(user.lastSeen).toLocaleString('vi-VN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


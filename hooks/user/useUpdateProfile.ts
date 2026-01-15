"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { uploadService } from "@/services/uploadService";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { user, setUser } = useAuthStore();

    return useMutation({
        mutationFn: async ({ username, avatar }: { username?: string; avatar?: File }) => {
            let avatarUrl = user?.avatar;

            if (avatar) {
                const res = await uploadService.uploadUserAvatar(avatar);
                avatarUrl = res.avatar;
            }

            if (username || avatarUrl) {
               const updatedUser = await userService.updateProfile({ 
                   username, 
                   avatar: avatarUrl 
               });
               return updatedUser;
            }
        },
        onSuccess: (updatedUser) => {
            if (updatedUser) {
                // Update local auth store
                if (user) {
                    setUser({ ...user, ...updatedUser });
                }
                // Invalidate query
                queryClient.invalidateQueries({ queryKey: ["me"] });
                toast.success("Cập nhật hồ sơ thành công!");
            }
        },
        onError: () => {
            toast.error("Cập nhật thất bại!");
        }
    });
};

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/features/user/services/userService";
import { uploadService } from "@/features/upload/services/uploadService";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { user, setUser } = useAuthStore();

    return useMutation({
        mutationFn: async ({ displayName, avatar, bio, phone }: { displayName?: string; avatar?: File; bio?: string; phone?: string }) => {
            let avatarUrl = user?.avatarUrl;

            if (avatar) {
                const res = await uploadService.uploadUserAvatar(avatar);
                avatarUrl = res.avatarUrl; // Assuming uploadService returns avatarUrl or we map it
            }

            if (displayName || avatarUrl || bio || phone) {
                // Check if userService.updateProfile supports these fields
               const updatedUser = await userService.updateProfile({ 
                   displayName,
                   avatarUrl: avatarUrl,
                   bio,
                   phone
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

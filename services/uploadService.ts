import api from "@/lib/axios";

export const uploadService = {
  uploadUserAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await api.post<{ avatar: string }>(
      "/upload/user/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  },

  uploadConversationAvatar: async (conversationId: string, file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await api.post<{ avatar: string }>(
      `/upload/conversation/${conversationId}/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  },
};

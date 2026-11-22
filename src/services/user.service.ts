
import axiosInstance from "@/lib/axios";

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  role: "student" | "tutor" | "admin";
  isPremium?: boolean;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: string;
  profileImage?: string;
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const { data } = await axiosInstance.get("/api/users/profile");
    return data.user ?? data.data ?? data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const { data } = await axiosInstance.patch("/api/users/profile", payload);
    return data.user ?? data.data ?? data;
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const { data } = await axiosInstance.get("/api/users");
    return data.users ?? data.data ?? [];
  },

  async updateUserRole(
    userId: string,
    role: "student" | "tutor" | "admin"
  ): Promise<void> {
    await axiosInstance.patch(`/api/users/${userId}/role`, { role });
  },

  async deleteUser(userId: string): Promise<void> {
    await axiosInstance.delete(`/api/users/${userId}`);
  },
};

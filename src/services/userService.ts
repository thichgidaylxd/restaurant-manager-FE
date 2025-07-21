import axiosInstance from "@/config/axios";
import { User } from "@/types/user";

// User service
export class UserService {
  static async getProfile(userId: string) {
    // Implementation to get user profile
    return { id: userId, name: "User" };
  }

  static async updateProfile(userId: string, data: any) {
    // Implementation to update user profile
    return { success: true };
  }

  static async getRoles() {
    try {
      const response = await axiosInstance.get("/role");
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  }

  static async deleteUser(userId: string) {
    // Implementation to delete user
    return { success: true };
  }
}

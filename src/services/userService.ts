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

  static async getPosition() {
    try {
      const response = await axiosInstance.get("/position");
      return response.data;
    } catch (error) {
      console.error("Error fetching position:", error);
      throw error;
    }
  }

  static async getRoles() {
    try {
      const response = await axiosInstance.get("/role");
      return response.data;
    } catch (error) {
      console.error("Error fetching position:", error);
      throw error;
    }
  }

  static async deleteUser(userId: string) {
    // Implementation to delete user
    return { success: true };
  }

  static async getAllEmployees() {
    const response = await axiosInstance.get("/employee");
    return response.data;
  }

  static async createEmployee(data: any) {
    console.log(data);
    const response = await axiosInstance.post("/employee", data);

    return response.data;
  }

  static async updateEmployee(data: any) {
    const response = await axiosInstance.put("/employee", data);
    return response.data;
  }

  static async deleteEmployee(employeeId: string) {
    const response = await axiosInstance.delete(`/employee/${employeeId}`);
    return response.data;
  }

  static async getAllPositions() {
    const response = await axiosInstance.get("/role");
    return response.data;
  }

  static async createPosition(roleName: string) {
    const response = await axiosInstance.post("/role", { roleName });
    return response.data;
  }

  static async deletePosition(roleId: string) {
    const response = await axiosInstance.delete(`/role/${roleId}`);
    return response.data;
  }

  static async getAllAccounts() {
    const response = await axiosInstance.get("/auth");
    return response.data;
  }
}

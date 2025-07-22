import { Position } from './../types/user';
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
    try {
      const response = await axiosInstance.get("/employee");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách nhân viên");
    }
  }

  static async createEmployee(data: any) {
    console.log(data);
    const response = await axiosInstance.post("/employee", data);

    return response.data;
  }

  static async updateEmployee(data: any) {
    try {
      const response = await axiosInstance.put("/employee", { data });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi cập nhật nhân viên");
    }
  }

  static async deleteEmployee(employeeId: string) {
    try {
      const response = await axiosInstance.delete(`/employee/${employeeId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi xóa nhân viên");
    }
  }

  static async getAllPositions() {
    try {
      const response = await axiosInstance.get("/position");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách chức vụ");
    }
  }

  static async createPosition(name: string) {
    try {
      const response = await axiosInstance.post("/position", { name });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi tạo chức vụ");
    }
  }

  static async deletePosition(positionId: string) {
    try {
      const response = await axiosInstance.delete(`/position/${positionId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi xóa chức vụ");
    }
  }

  static async getAllAccounts() {
    try {
      const response = await axiosInstance.get("/auth");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách tài khoản");
    }
  }
}

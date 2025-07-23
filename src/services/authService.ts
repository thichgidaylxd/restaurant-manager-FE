import axiosInstance from "@/config/axios";

// Authentication service
export class AuthService {
  static async login(account: { account: string, password: string }) {
    try {
      const response = await axiosInstance.post("/auth/login", account);
      if (response.data.code == 200) {

        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));

        return {
          success: true,
          user: response.data.data.user,
          token: response.data.data.token,
        };
      }

      return {
        success: false,
        message: response.data.message || "Đăng nhập thất bại",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi kết nối server",
      };
    }
  }

  static async logout() {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.warn("Logout server call failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setTimeout(() => {
        console.log("Token sau khi xóa:", localStorage.getItem("token")); // nên là null
        window.location.href = "/";
      }, 100);
    }
    return { success: true };
  }

  static async register(Account: { accountName: string, account: string, roleId: string, password: string, confirmPassword: string }) {
    try {

      const response = await axiosInstance.post("/auth/register", Account);
      console.log("Register response:", response.data);
      if (response.data.code === 200) {
        return { success: true, user: response.data.user };
      }

      return {
        success: false,
        message: response.data.message || "Đăng ký thất bại",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Lỗi kết nối server",
      };
    }
  }

  static async getCurrentUser() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return null;
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      const response = await axiosInstance.get("/auth/me");

      if (response.data.success && response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return response.data.user;
      }

      return null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    return !!token;
  }

  static getToken(): string | null {
    return localStorage.getItem("token");
  }
}
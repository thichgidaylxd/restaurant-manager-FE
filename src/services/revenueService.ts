import axiosInstance from "@/config/axios";

interface Revenue {
    id: string;
    date: string;
    totalAmount: number;
    invoiceCount: number;
}

interface ApiResponse<T> {
    code: number;
    status: string;
    message: string;
    data: T;
}

export class RevenueService {
    // Lấy doanh thu theo ngày (trả về một đối tượng Revenue)
    static async getRevenueByDay(date: string) {
        try {
            const response = await axiosInstance.get<ApiResponse<Revenue>>("/revenue/day", {
                params: { date },
            });
            console.log("Response from GET /revenue/day:", response.data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Lỗi khi lấy doanh thu theo ngày");
        }
    }

    // Lấy doanh thu theo tuần chứa ngày (trả về mảng Revenue[])
    static async getRevenueByWeek(date: string) {
        try {
            const response = await axiosInstance.get<ApiResponse<Revenue[]>>("/revenue/week", {
                params: { date },
            });
            console.log("Response from GET /revenue/week:", response.data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Lỗi khi lấy doanh thu theo tuần");
        }
    }

    // Lấy doanh thu theo tháng (trả về mảng Revenue[])
    static async getRevenueByMonth(month: string) {
        try {
            const response = await axiosInstance.get<ApiResponse<Revenue[]>>("/revenue/month", {
                params: { month },
            });
            console.log("Response from GET /revenue/month:", response.data);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Lỗi khi lấy doanh thu theo tháng");
        }
    }
}
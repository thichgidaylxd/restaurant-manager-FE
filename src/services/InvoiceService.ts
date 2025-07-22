import axiosInstance from "@/config/axios";
const BASE_URL = "http://localhost:8081/restaurant/api";
export class InvoiceService {

  static async getAllInvoices() {
    try {
      const response = await axiosInstance.get("/invoice");
      console.log("Invoices fetched successfully:", response.data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách hóa đơn");
    }
  }

  static async getInvoiceByTable(tableId: string) {
    try {
      const response = await axiosInstance.get(`/invoice/${tableId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi lấy hóa đơn theo bàn");
    }
  }

  static async createInvoice(tableId: string, payMethod: string) {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/invoice/${tableId}`, null, {
        params: { payMethod }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi tạo hóa đơn");
    }
  }

  static async getAllInvoicesByDate(date: string) {
    try {
      const response = await axiosInstance.get(`/invoice?createdAt=${date}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách hóa đơn theo ngày");
    }
  }

  static async deleteInvoice(invoiceId: string) {
    try {
      const response = await axiosInstance.delete(`/invoice/${invoiceId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lỗi khi xóa hóa đơn");
    }
  }
}
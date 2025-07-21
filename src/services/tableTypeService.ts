import axiosInstance from "@/config/axios";

export class TableTypeService {
  static async getAllTableTypes() {
    const res = await axiosInstance.get("/tables/type");
    return res.data;
  }
  static async createTableType(name: string) {
    const res = await axiosInstance.post("/tables/type", { name });
    return res.data;
  }
  static async deleteTableType(id: string) {
    const res = await axiosInstance.delete(`/tables/type/${id}`);
    return res.data;
  }
} 
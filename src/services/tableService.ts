import { useCallback, useState } from "react";
import { OrderItem, RestaurantTable, TableType } from "@/types/table";
import { Dish } from "@/types/dish";
import axiosInstance from "@/config/axios";

const BASE_URL = "http://localhost:8081/restaurant/api";

interface TableData {
  tables: RestaurantTable[];
  setTables: React.Dispatch<React.SetStateAction<RestaurantTable[]>>;
  menuItems: Dish[];
  loading: boolean;
  error: string | null;
  apiMessage: string | null;
  tableTypes: TableType[];
  updateTableStatus: (tableId: string, status: string) => Promise<void>;
  addNewTable: (table: Partial<RestaurantTable>) => Promise<void>;
  addDishesToTable: (tableId: string, items: any[]) => Promise<void>;
  updateDishStatus: (tableId: string, dishId: string, status: string) => Promise<void>;
  updateDishQuantity: (tableId: string, orderItemUpdateQuantity: { orderItemId: string, quantity: number }) => Promise<void>;
  removeDishFromTable: (tableId: string, orderItemId: string) => Promise<void>;
  processPayment: (tableId: string) => Promise<void>;
  getTableStatistics: () => Promise<{
    total: number;
    occupied: number;
    available: number;
    reserved: number;
    revenue: number;
  }>;
  getTableById: (tableId: string) => RestaurantTable | undefined;
  fetchTableDishes: (tableId: string) => Promise<void>;
  fetchTables: () => Promise<void>;
  fetchTableTypes: () => Promise<void>;
  fetchMenuItems: () => Promise<void>;
  clearError: () => void;
  deleteTable: (tableId: string) => Promise<void>;
}

export const useTableService = (): TableData => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [tableTypes, setTableTypes] = useState<TableType[]>([]);
  const [menuItems, setMenuItems] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);



  const fetchTableTypes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${BASE_URL}/tables/type`);
      console.log("Fetching table types from:", `${BASE_URL}/tables/type`);
      console.log("Response from GET /tables/type:", response.data);

      const result = await response.data;
      if (result.code === 200) {
        setTableTypes(result.data || []);
        console.log("Loaded table types:", result.data);
        return result.data || [];
      } else {
        setApiMessage(result.message || "Không thể tải danh sách loại bàn");
      }
    } catch (err) {
      setError("Lỗi kết nối server khi tải loại bàn");
    } finally {
      setLoading(false);
    }
  }, []);



  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${BASE_URL}/tables`);
      console.log("Fetching tables from:", `${BASE_URL}/tables`);
      console.log("Response from GET /tables:", response.data);

      const result = await response.data;
      if (result.code === 200) {
        setTables(result.data || []);
      } else {
        setApiMessage(result.message || "Không thể tải danh sách bàn");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${BASE_URL}/dishes`);
      console.log("Fetching menu items from:", `${BASE_URL}/dishes`);
      console.log("Response from GET /dishes:", response.data);
      const result = await response.data;
      if (result.code === 200) {
        setMenuItems(result.data || []);
      } else {
        setApiMessage(result.message || "Không thể tải thực đơn");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTableDishes = useCallback(async (tableId: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${BASE_URL}/order-items/${tableId}`);
      console.log("Fetching dishes for table:", tableId);
      console.log("Response from GET /order-items:", response.data);
      const result = await response.data;
      if (result.code === 200) {
        setTables((prev) =>
          prev.map((t) =>
            t.id === tableId ? { ...t, dishes: result.data } : t
          )
        );
      } else {
        setApiMessage(result.message || "Không thể tải món ăn của bàn");
      }
    } catch (err) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTableStatus = useCallback(async (tableId: string, status: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await axiosInstance.patch(
        `${BASE_URL}/tables/${tableId}/update-status`, { status }

      );
      const result = response.data;
      if (result.code !== 200) {
        setApiMessage(result.message || "Không thể cập nhật trạng thái bàn");
        throw new Error(result.message || "Không thể cập nhật trạng thái bàn");
      }
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId ? { ...t, status } : t
        )
      );
      setApiMessage(result.message || "Bàn đã cập nhật trạng thái mới");
    } catch (err) {
      setError("Lỗi khi cập nhật trạng thái bàn");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addNewTable = useCallback(async (restaurantTable: Partial<RestaurantTable>) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`${BASE_URL}/tables`, restaurantTable);
      const result = await response.data;
      if (result.code !== 200) {
        setApiMessage(result.message || "Không thể thêm bàn mới");
        throw new Error(result.message || "Không thể thêm bàn mới");
      }
    } catch (err) {
      setError("Lỗi khi thêm bàn mới");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addDishesToTable = useCallback(
    async (
      tableId: string,
      orderItems: { tableId: string; dishId: string; quantity: number; note?: string }[]
    ): Promise<void> => {
      try {
        const response = await axiosInstance.post(`/order-items/${tableId}`, orderItems);
        if (response.data.code !== 200) {
          throw new Error(response.data.message || "Không thể thêm món vào bàn");
        }
        console.log("Dishes added to table:", tableId);
        console.log("Response from POST /order-items:", response.data);
      } catch (err: any) {
        throw new Error(err.response?.data?.message || err.message || "Không thể thêm món vào bàn");
      }
    },
    []
  );

  const updateDishStatus = useCallback(async (tableId: string, orderItemId: string, status: string) => {
    setLoading(true);
    try {
      console.log("Updating dish status:", orderItemId, "to", status);
      const response = await axiosInstance.patch(
        `${BASE_URL}/order-items/${orderItemId}/update-status`, null,
        { params: { status } }
      );
      const result = response.data;
      if (result.code !== 200) {
        setApiMessage(result.message || "Không thể cập nhật trạng thái món");
        throw new Error(result.message || "Không thể cập nhật trạng thái món");
      }
      setApiMessage(result.message || "Cập nhật trạng thái món thành công");
    } catch (err) {
      setError("Lỗi khi cập nhật trạng thái món");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDishQuantity = useCallback(async (tableId: string, orderItemUpdateQuantity: { orderItemId: string, quantity: number }) => {
    setLoading(true);
    try {

      console.log("Updating dish quantity:", orderItemUpdateQuantity);
      const response = await axiosInstance.patch(
        `${BASE_URL}/order-items/${tableId}/quantity`,
        orderItemUpdateQuantity
      );
      const result = response.data;
      if (result.code !== 200) {
        setApiMessage(result.message || "Không thể cập nhật số lượng món");
        throw new Error(result.message || "Không thể cập nhật số lượng món");
      }
      setApiMessage(result.message || "Cập nhật số lượng món thành công");
      // Cập nhật lại danh sách món của bàn
      await fetchTableDishes(tableId);
    } catch (err) {
      setError("Lỗi khi cập nhật số lượng món");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeDishFromTable = useCallback(async (tableId: string, orderItemId: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.delete(`${BASE_URL}/order-items/${orderItemId}`, { params: { tableId } });
      const result = response.data;
      if (result.code !== 200) {
        setApiMessage(result.message || "Không thể xóa món khỏi bàn");
        throw new Error(result.message || "Không thể xóa món khỏi bàn");
      }
      setApiMessage(result.message);
      // Có thể cập nhật lại state tables nếu cần
      await fetchTables();
    } catch (err) {
      setError("Lỗi khi xóa món khỏi bàn");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTable = useCallback(async (tableId: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.delete(`${BASE_URL}/tables/${tableId}`);
      const result = response.data;
      console.log("Deleting table:", tableId);
      console.log("Response from DELETE /tables:", result);
      if (result.code !== 200) {
        setApiMessage(result.message || "Không thể xóa bàn");
        throw new Error(result.message || "Không thể xóa bàn");
      }
      setApiMessage(result.message || "Xóa bàn thành công");
    } catch (err) {
      setError("Lỗi khi xóa bàn");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const processPayment = useCallback(async (tableId: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(`${BASE_URL}/invoice/${tableId}`);
      console.log("Processing payment for table:", tableId);
      console.log("Response from POST /invoice:", response.data);
      const result = await response.data;
      if (result.code !== 200) {
        setApiMessage(result.message || "Không thể tạo hóa đơn");
        throw new Error(result.message || "Không thể tạo hóa đơn");
      }
      // Nếu muốn lấy dữ liệu hóa đơn trả về: result.data
    } catch (err) {
      setError("Lỗi khi tạo hóa đơn");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTableStatistics = async () => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/tables`);
      const result = await response.data;
      if (result.code === 200) {
        const data = result.data || [];
        return {
          total: data.length,
          occupied: data.filter((t: RestaurantTable) => t.status === "Đang sử dụng").length,
          available: data.filter((t: RestaurantTable) => t.status === "Trống").length,
          reserved: data.filter((t: RestaurantTable) => t.status === "Đã đặt").length,
          revenue: 0, // Cần API invoices để tính
        };
      }
      return { total: 0, occupied: 0, available: 0, reserved: 0, revenue: 0 };
    } catch (err) {
      console.error("Lỗi khi lấy thống kê:", err);
      return { total: 0, occupied: 0, available: 0, reserved: 0, revenue: 0 };
    }
  };

  const getTableById = (tableId: string) => {
    return tables.find((t) => t.id === tableId);
  };

  const clearError = () => {
    setError(null);
    setApiMessage(null);
  };

  return {
    tables,
    setTables,
    menuItems,
    loading,
    error,
    apiMessage,
    tableTypes,
    updateTableStatus,
    addNewTable,
    addDishesToTable,
    updateDishStatus,
    updateDishQuantity,
    removeDishFromTable,
    processPayment,
    getTableStatistics,
    getTableById,
    fetchTableDishes,
    fetchTables,
    fetchMenuItems,
    clearError,
    deleteTable,
    fetchTableTypes
  };
};
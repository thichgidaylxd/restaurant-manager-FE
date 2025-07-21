import "@/init";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { RestaurantTable } from "@/types/table";
import { Dish, CartItem, Notification } from "@/types/dish";
import { calculateTableTotal } from "@/utils/tableUtils";
import TableCard from "./TableCard";
import DishCard from "./DishCard";
import TableMenu from "./TableMenu";
import Sidebar from "../layout/Sidebar";
import CartSidebar from "./CartSidebar";
import NotificationSidebar from "./NotificationSidebar";
import PaymentDialog from "./PaymentDialog";
import { InvoiceService } from "@/services/InvoiceService";
import { useTableService } from "@/services/tableService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { TableTypeService } from "@/services/tableTypeService";

interface TableType {
  id: string;
  name: string;
}

const TableGrid = () => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedTableType, setSelectedTableType] = useState<string | null>(null);
  const [selTable, setSelTable] = useState<string | null>(null);
  const [selDish, setSelDish] = useState<string | null>(null);
  const [showDelNotif, setShowDelNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [isTableView, setIsTableView] = useState(false);
  const [isMenuView, setIsMenuView] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [showPay, setShowPay] = useState(false);
  const [payMethod, setPayMethod] = useState<"cash" | "transfer" | null>(null);
  const [showPayOpt, setShowPayOpt] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [tableStats, setTableStats] = useState({
    total: 0,
    occupied: 0,
    available: 0,
    reserved: 0,
    revenue: 0,
  });
  const [dishError, setDishError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTable, setNewTable] = useState({
    name: "",
    tableTypeId: "",
    maxPerson: "",
    note: "",
  });
  const [addTableError, setAddTableError] = useState<string | null>(null);
  const [timeClicked, setTimeClicked] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteTable, setShowDeleteTable] = useState(false);
  const [selTableDelete, setSelTableDelete] = useState<string | null>(null);
  const [showAddType, setShowAddType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  const {
    tables = [],
    setTables,
    menuItems = [],
    tableTypes = [],
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
    deleteTable,
    clearError,
    fetchTableTypes
  } = useTableService();


  // Fetch table types for dropdown
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        await fetchTableTypes();
      } catch (err) {
        setAddTableError("Không thể tải danh sách loại bàn");
      }
    };
    fetchTypes();
  }, [fetchTableTypes]);

  const recordPaymentRequestTime = async () => {
    await updateTableStatus(selTable, "Chờ thanh toán");
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTimeClicked(formattedTime);
  };

  // Automatically fetch tables on component mount
  useEffect(() => {
    const loadTables = async () => {
      try {
        await fetchTables();
        setTableError(null);
      } catch (err) {
        console.error("Lỗi khi tải danh sách bàn:", err);
        setTableError("Không thể tải danh sách bàn. Vui lòng thử lại.");
      }
    };
    loadTables();
  }, [fetchTables]);

  // Load table statistics when tables change
  useEffect(() => {
    loadTableStatistics();
  }, [tables]);

  // Load dishes when a table is selected
  useEffect(() => {
    if (selTable) {
      setDishError(null);
      fetchTableDishes(selTable).catch((err) => {
        console.error("Lỗi khi tải món ăn:", err);
        setDishError("Không thể tải danh sách món ăn của bàn");
      });
    }
  }, [selTable, fetchTableDishes]);

  const loadTableStatistics = async () => {
    try {
      const stats = await getTableStatistics();
      setTableStats(stats || { total: 0, occupied: 0, available: 0, reserved: 0, revenue: 0 });
    } catch (err) {
      console.error("Lỗi khi tải thống kê bàn:", err);
      setTableStats({ total: 0, occupied: 0, available: 0, reserved: 0, revenue: 0 });
    }
  };




  const addToCart = (item: Dish) => {
    setCart((c) => {
      const exists = c.find((i) => i.id === item.id);
      return exists
        ? c.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
        : [...c, { id: item.id, name: item.name, price: item.price, image: item.image ?? "", quantity: 1, note: "" }];
    });
  };

  const updateCartQty = (id: string, change: number) => {
    setCart(
      (c) =>
        c
          .map((i) =>
            i.id === id
              ? i.quantity + change > 0
                ? { ...i, quantity: i.quantity + change }
                : null
              : i
          )
          .filter((i) => i) as CartItem[]
    );
  };

  const updateCartNote = (id: string, note: string) => {
    setCart((c) =>
      c.map((i) => (i.id === id ? { ...i, note } : i))
    );
  };

  const addCartToTable = async () => {
    if (selTable && cart.length > 0) {
      try {
        const orderItems = cart.map((item) => ({
          tableId: selTable,
          dishId: item.id,
          quantity: item.quantity,
          note: item.note || undefined,
        }));
        await addDishesToTable(selTable, orderItems);
        await fetchTables();
        setCart([]);
        setIsMenuView(false);
        await fetchTableDishes(selTable);
      } catch (err) {
        console.error("Lỗi khi thêm giỏ hàng vào bàn:", err);
        setDishError("Không thể thêm món vào bàn");
      }
    }
  };

  const updateUncalledDishes = async () => {
    if (selTable) {
      try {
        const currentTable = getTableById(selTable);
        const uncalledDishes = currentTable?.dishes?.filter(dish => dish.status === "Chưa gọi");

        if (uncalledDishes && uncalledDishes.length > 0) {
          for (const dish of uncalledDishes) {
            await updateDishStatus(selTable, dish.id, "Đã gọi");
            setNotifs((prev) => [
              ...prev,
              {
                id: `notif-${Date.now()}`,
                tableId: selTable,
                dishId: dish.id,
                dishName: dish.dishName,
                quantity: 1,
                status: dish.status,
                timestamp: Date.now(),
              },
            ]);
          }
          await fetchTableDishes(selTable);
          toast({ title: "Đã cập nhật trạng thái các món 'Chưa gọi' thành 'Đã gọi'!" });
        } else {
          toast({ title: "Không có món nào ở trạng thái 'Chưa gọi'" });
        }
      } catch (err) {
        console.error("Lỗi khi cập nhật các món:", err);
        setDishError("Không thể cập nhật trạng thái món");
        toast({ title: "Cập nhật trạng thái thất bại!", variant: "destructive" });
      }
    }
  };

  // NOTE: Xử lý cập nhật trạng thái món ăn (order item) và hiển thị thông báo thành công/thất bại
  // Khi người dùng bấm nút đổi trạng thái trên DishCard, hàm này sẽ gọi API /order-items/{orderItemId}/update-status
  // Sau khi cập nhật, sẽ reload lại danh sách món và hiển thị toast phản hồi
  const toggleStatus = async (dishId: string) => {
    if (selTable) {
      try {
        const currentTable = getTableById(selTable);
        const dish = currentTable?.dishes?.find((d) => d.id === dishId);
        if (dish) {
          const newStatus =
            dish.status === "Đã gọi"
              ? "Đang chuẩn bị"
              : dish.status === "Đang chuẩn bị"
                ? "Đã hoàn thành"
                : dish.status === "Đã hoàn thành"
                  ? "Bị hủy"
                  : "Đã gọi";
          await updateDishStatus(selTable, dishId, newStatus);
          await fetchTableDishes(selTable);
          setNotifs((prev) => [
            ...prev,
            {
              id: `notif-${Date.now()}`,
              tableId: selTable,
              dishId: dish.id,
              dishName: dish.dishName,
              quantity: 1,
              status: dish.status,
              timestamp: Date.now(),
            },
          ]);
          toast({ title: "Cập nhật trạng thái thành công!" });
        }
      } catch (err) {
        console.error("Lỗi khi thay đổi trạng thái món:", err);
        setDishError("Không thể cập nhật trạng thái món");
        toast({ title: "Cập nhật trạng thái thất bại!", variant: "destructive" });
      }
    }
  };




  const handleQuantityChange = async (orderItemId: string, quantity: number) => {
    if (selTable) {
      try {
        await updateDishQuantity(selTable, { orderItemId, quantity });
        await fetchTableDishes(selTable);
      } catch (err) {
        console.error("Lỗi khi cập nhật số lượng món:", err);
        setDishError("Không thể cập nhật số lượng món");
      }
    }
  };

  const addTable = async () => {
    try {

      const tableName = newTable.name;
      const existingTable = tables.find((t) => t.name === tableName);
      if (existingTable) {
        setAddTableError(`Bàn ${tableName} đã tồn tại. Vui lòng chọn tên khác.`);
        return;
      }
      const tableTypeId = newTable.tableTypeId || selectedTableType;
      if (!tableTypeId) {
        setAddTableError("Vui lòng chọn loại bàn.");
        return;
      }
      if (!newTable.maxPerson || isNaN(parseInt(newTable.maxPerson)) || parseInt(newTable.maxPerson) <= 0) {
        setAddTableError("Số lượng người tối đa phải là số dương.");
        return;
      }
      const payload = {
        name: tableName,
        tableType: {
          id: tableTypeId,
          name: tableTypes.find((t) => t.id === tableTypeId)?.name || "",
        },
        maxPerson: parseInt(newTable.maxPerson),
        note: newTable.note || null,
      };
      console.log("Sending POST /tables with payload:", payload);
      await addNewTable(payload);
      console.log("Table added successfully:", payload);
      await fetchTables();
      setTableError(null);
      setNotifMessage("Thêm bàn thành công!");
      setShowDelNotif(true);
      setShowAddTable(false);
      setNewTable({ name: "", tableTypeId: selectedTableType || "", maxPerson: "", note: "" });
      setSelectedTableType(null);
      setAddTableError(null);
      setTimeout(() => setShowDelNotif(false), 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể thêm bàn mới. Vui lòng thử lại.";
      console.error("Lỗi khi thêm bàn mới:", {
        message: errorMessage,
        status: err.response?.status,
        data: err.response?.data,
      });
      setAddTableError(errorMessage);
    }
  };

  const delDish = async (orderItemId: string) => {
    if (selTable) {
      try {
        await removeDishFromTable(selTable, orderItemId);
        setSelDish(null);
        setNotifMessage("Xóa món thành công!");
        setShowDelNotif(true);
        setTimeout(() => setShowDelNotif(false), 3000);
        await fetchTableDishes(selTable);
      } catch (err) {
        console.error("Lỗi khi xóa món khỏi bàn:", err);
        setDishError("Không thể xóa món khỏi bàn");
      }
    }
  };

  const handleTableClick = async (table: RestaurantTable) => {
    setAnimating(true);
    setTimeout(() => {
      setSelTable(table.id);
      setSelTableDelete(table.id);
      setIsTableView(true);
      setAnimating(false);
      setSelDish(null);
      setIsMenuView(false);
      setDishError(null);
      setTableError(null);
      window.history.pushState(null, "", `/banan/${table.id}`);
    }, 300);
  };

  const handleDeleteTable = async () => {
    if (!selTableDelete) return;
    setDeleting(true);
    try {
      await deleteTable(selTableDelete);
      setNotifMessage("Xóa bàn thành công!");
      setShowDelNotif(true);
      setSelTableDelete(null);
      setIsTableView(false);
      setShowDeleteTable(false);
      setTimeout(() => setShowDelNotif(false), 3000);
      fetchTables();
    } catch (err) {
      setNotifMessage("Xóa bàn thất bại!");
      setShowDelNotif(true);
      setShowDeleteTable(false);
      setTimeout(() => setShowDelNotif(false), 3000);
    } finally {
      setDeleting(false);
    }
  };

  const backToGrid = () => {
    setAnimating(true);
    setTimeout(() => {
      setSelTable(null);
      setIsTableView(false);
      setIsMenuView(false);
      setAnimating(false);
      setDishError(null);
      setTableError(null);
      window.history.pushState(null, "", "/banan");
    }, 300);
  };

  const showMenu = async () => {
    if (selTable) {
      setIsMenuView(true);
      setCart([]);
      try {
        await fetchMenuItems();
      } catch (err) {
        console.error("Lỗi khi tải thực đơn:", err);
        setDishError("Không thể tải thực đơn");
      }
    }
  };

  const backFromMenu = () => {
    setIsMenuView(false);
    setCart([]);
    setDishError(null);
  };

  const payRequest = async () => {
    if (selTable) {
      try {
        const response = await InvoiceService.getInvoiceByTable(selTable);
        if (response.code === 200) {
          setShowPay(true);
          setPayMethod(null);
          setShowPayOpt(false);
        } else {
          setDishError(response.message || "Không thể tải hóa đơn");
        }
      } catch (err) {
        console.error("Lỗi khi lấy hóa đơn:", err);
        setDishError("Không thể tải hóa đơn");
      }
    }
  };

  const selectPayMethod = async (method: "cash" | "transfer") => {
    if (selTable) {
      setPayMethod(method);
      try {
        setShowPayOpt(true);
        if (method === "transfer") {
          genQR();
        }
      } catch (err) {
        setDishError("Không thể tạo hóa đơn");
      }
    }
  };

  const confirmPay = async () => {
    if (selTable) {
      try {
        await processPayment(selTable);
        setShowPayOpt(true);
        fetchTables()

        setNotifMessage("Thanh toán thành công!");
        setShowPay(false);
        setShowDelNotif(true);
        setTimeout(() => setShowDelNotif(false), 3000);
        fetchTableDishes(selTable);
      } catch (err) {
        console.error("Lỗi khi xác nhận thanh toán:", err);
        setDishError("Không thể xác nhận thanh toán");
      }
    }
  };

  const genQR = async () => {
    if (selTable) {
      try {
        const currentTable = getTableById(selTable);
        const total = calculateTableTotal(currentTable?.dishes);
        setQrUrl(`https://img.vietqr.io/image/mbbank-02012345678909-compact2.jpg?amount=${total}&accountName=LE%20XUAN%20DUNG`);
      } catch (err) {
        console.error("Lỗi khi tạo mã QR:", err);
        setDishError("Không thể tạo mã QR");
      }
    }
  };

  const closePay = () => {
    setShowPay(false);
    setPayMethod(null);
    setShowPayOpt(false);
    setQrUrl("");
    setDishError(null);
    setTableError(null);
  };

  const tableStatuses = ["Trống", "Đang sử dụng", "Đã đặt"];
  const statusMap: Record<string, string> = {
    Trống: "Trống",
    "Đang sử dụng": "Đang sử dụng",
    "Đã đặt": "Đã đặt",
  };

  const filteredTables = tables.filter((t) => {
    const name = t.name || "";
    return (
      name.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "all" || t.status === statusMap[filter]) &&
      (selectedTableType === null || t.tableType.id === selectedTableType)
    );
  });

  const currentTable = selTable ? getTableById(selTable) : null;
  const total = calculateTableTotal(currentTable?.dishes);

  const handleAddTableType = async () => {
    if (newTypeName.trim()) {
      try {
        const res = await TableTypeService.createTableType(newTypeName);
        if (res.code === 200) {
          await fetchTableTypes();
          setShowAddType(false);
          const added = res.data.find(t => t.name === newTypeName) || res.data[res.data.length - 1];
          setNewTable({ ...newTable, tableTypeId: added.id });
          setNewTypeName("");
          toast({ title: "Thêm loại bàn thành công!" });
        } else {
          toast({ title: "Thêm loại bàn thất bại!", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Lỗi khi thêm loại bàn!", variant: "destructive" });
      }
    }
  };

  return (
    <div className="table-grid-container flex w-full h-screen bg-orange-50 text-foreground">
      {/* Sidebar */}
      <Sidebar />
      <div
        className={`flex-1 transition-all duration-500 ${animating ? "opacity-50 scale-95" : "opacity-100 scale-100"} flex flex-col h-full`}
      >
        {!isTableView ? (
          <div className="w-full bg-orange-50 flex flex-col h-full">
            <div className="p-6 bg-orange-50">
              <div className="flex space-x-4 mb-6 justify-between">
                <div className="flex space-x-4">
                  <div
                    className="bg-amber-800 text-white px-6 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 animate-fade-in-up hover-lift animate-glow relative overflow-hidden"
                    style={{ animationDelay: "0.1s" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-900 opacity-0 hover:opacity-100 transition-opacity duration-300 animate-gradient"></div>
                    <div className="relative z-10">
                      <div
                        className="text-sm opacity-90 animate-fade-in-up"
                        style={{ animationDelay: "0.2s" }}
                      >
                        Đang sử dụng:
                      </div>
                      <div className="text-xl font-bold animate-heartbeat">
                        {tableStats.occupied}
                      </div>
                    </div>
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                  </div>
                  <div
                    className="bg-amber-700 text-white px-6 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 animate-fade-in-up hover-lift animate-float relative overflow-hidden"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div
                        className="text-sm opacity-90 animate-fade-in-up"
                        style={{ animationDelay: "0.3s" }}
                      >
                        Số bàn trống:
                      </div>
                      <div
                        className="text-xl font-bold animate-bounce-in"
                        style={{ animationDelay: "0.4s" }}
                      >
                        {tableStats.available}
                      </div>
                    </div>
                    <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div
                    className="bg-amber-600 text-white px-6 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 animate-fade-in-up hover-lift hover-rotate relative overflow-hidden"
                    style={{ animationDelay: "0.3s" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-300 animate-gradient"></div>
                    <div className="relative z-10">
                      <div
                        className="text-sm opacity-90 animate-fade-in-up"
                        style={{ animationDelay: "0.4s" }}
                      >
                        Tổng số bàn:
                      </div>
                      <div
                        className="text-xl font-bold animate-zoom-in"
                        style={{ animationDelay: "0.5s" }}
                      >
                        {tableStats.total}
                      </div>
                    </div>
                    <div
                      className="absolute bottom-1 left-1 w-1 h-1 bg-blue-400 rounded-full animate-ping"
                      style={{ animationDelay: "0.3s" }}
                    ></div>
                  </div>
                </div>
                <div
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white px-8 py-4 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up hover-glow animate-gradient relative overflow-hidden"
                  style={{ animationDelay: "0.4s" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-0 hover:opacity-20 transition-opacity duration-500 animate-gradient"></div>
                  <div className="relative z-10">
                    <div
                      className="text-sm opacity-90 animate-slide-in-from-right"
                      style={{ animationDelay: "0.5s" }}
                    >
                      Doanh thu:
                    </div>
                    <div className="text-xl font-bold animate-heartbeat">
                      {tableStats.revenue.toLocaleString()}.VND
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 text-yellow-300 animate-rotate-slow">
                    💰
                  </div>
                  <div className="absolute bottom-1 left-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4 animate-slide-in-from-left hover-scale">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px] hover:shadow-lg transition-all duration-300 hover-glow">
                      <SelectValue placeholder="Tất cả bàn" />
                    </SelectTrigger>
                    <SelectContent className="animate-zoom-in">
                      <SelectItem
                        value="all"
                        className="hover:bg-orange-100 transition-colors duration-200"
                      >
                        Tất cả bàn
                      </SelectItem>
                      {tableStatuses.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="hover:bg-orange-100 transition-colors duration-200"
                        >
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedTableType || undefined}
                    onValueChange={(value) => setSelectedTableType(value === "all" ? null : value)}
                  >
                    <SelectTrigger className="w-[180px] hover:shadow-lg transition-all duration-300 hover-glow">
                      <SelectValue placeholder="Tất cả loại bàn" />
                    </SelectTrigger>
                    <SelectContent className="animate-zoom-in">
                      <SelectItem
                        value="all"
                        className="hover:bg-orange-100 transition-colors duration-200"
                      >
                        Tất cả loại bàn
                      </SelectItem>
                      {tableTypes.map((type) => (
                        <div key={type.id} className="relative group flex items-center">
                          <SelectItem
                            value={type.id}
                            className="hover:bg-orange-100 transition-colors duration-200 pr-10"
                          >
                            {type.name}
                          </SelectItem>
                          <button
                            className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 z-10 bg-white rounded-full p-1 shadow hover:scale-110"
                            title="Xóa loại bàn"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (window.confirm(`Bạn có chắc muốn xóa loại bàn '${type.name}'?`)) {
                                try {
                                  const res = await TableTypeService.deleteTableType(type.id);
                                  if (res && res.code === 200) {
                                    await fetchTableTypes();
                                    toast({ title: "Đã xóa loại bàn thành công!" });
                                  } else {
                                    toast({ title: "Xóa loại bàn thất bại!", variant: "destructive" });
                                  }
                                } catch {
                                  toast({ title: "Lỗi khi xóa loại bàn!", variant: "destructive" });
                                }
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                      <SelectSeparator />
                      <div className="px-2 py-1">
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 rounded bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold transition"
                          onClick={() => setShowAddType(true)}
                        >
                          <Plus className="w-4 h-4" /> Thêm loại bàn
                        </button>
                      </div>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 animate-slide-in-from-right">
                  <div className="relative hover-lift">
                    <Input
                      type="text"
                      placeholder="Tìm kiếm"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pr-8 w-64 hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-orange-300 hover-glow"
                    />
                    <svg
                      className="h-5 w-5 absolute right-3 top-2 text-gray-400 animate-pulse"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <button
                    onClick={fetchTables}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-lg transition-all duration-300 hover-rotate hover:border-orange-300 group"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500 group-hover:text-orange-500 transition-colors duration-300 animate-rotate-slow"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-6">
              {tableError ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <p className="text-red-600 font-medium mb-4">{tableError}</p>
                    <button
                      onClick={() => {
                        setTableError(null);
                        fetchTables();
                      }}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              ) : tables.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🍽️</div>
                    <p className="text-gray-600 font-medium text-lg">
                      Chưa có bàn nào để hiển thị.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-6 pb-6">
                  {filteredTables.map((t, i) => (
                    <TableCard
                      key={t.id}
                      table={t}
                      index={i}
                      onDelete={() => {
                        setSelTableDelete(t.id);
                        setShowDeleteTable(true);
                        handleDeleteTable();
                      }}
                      onClick={handleTableClick}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-orange-50 border-t border-orange-200 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3 animate-fade-in-right">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-3 border-white flex items-center justify-center text-sm font-bold shadow-lg transform hover:scale-110 transition-all duration-300 animate-bounce-in hover-lift animate-float cursor-pointer relative overflow-hidden"
                      style={{
                        backgroundColor: `hsl(${i * 60}, 70%, 60%)`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    >
                      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-300 animate-gradient"></div>
                      <span
                        className="relative z-10 animate-heartbeat"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      >
                        {String.fromCharCode(65 + i - 1)}
                      </span>
                      <div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      ></div>
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-semibold animate-fade-in-up hover:text-orange-600 transition-colors duration-200">
                  5 người khác đang online
                </span>
              </div>
              <Button
                className="flex items-center gap-2 font-semibold text-base shadow-md bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 hover:from-orange-600 hover:via-orange-400 hover:to-yellow-500 text-white rounded-xl px-8 py-3 transition-all duration-200 transform hover:scale-110 hover:shadow-2xl hover:shadow-orange-300 border-2 border-orange-400 hover:border-yellow-400 focus:ring-4 focus:ring-orange-200 group"
                onClick={() => setShowAddTable(true)}
              >
                <Plus className="w-5 h-5 group-hover:animate-spin transition-all duration-300" />
                Thêm bàn
              </Button>
            </div>
          </div>
        ) : !isMenuView ? (
          <div className="w-full bg-orange-50 p-6 rounded-lg flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-orange-200 shrink-0">
              <div className="flex items-center space-x-4">
                <button
                  onClick={backToGrid}
                  className="p-2 rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-50 hover:-translate-x-1 animate-bounce-in"
                >
                  <ArrowLeft className="w-5 h-5 hover:-translate-x-1" />
                </button>
                <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg border-2 border-orange-300 animate-bounce-in">
                  <h1 className="text-xl font-bold">{currentTable?.name || "N/A"}</h1>
                </div>
              </div>
              <button
                onClick={showMenu}
                className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg border-2 border-orange-300 hover:bg-orange-200 font-medium hover:scale-105 hover:shadow-lg animate-bounce-in"
              >
                Thực đơn
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {dishError ? (
                <div className="col-span-full text-center py-8 text-red-500 animate-fade-in">
                  <div className="text-6xl mb-4">⚠️</div>
                  <p className="font-medium">{dishError}</p>
                  <button
                    onClick={() => {
                      setDishError(null);
                      fetchTableDishes(selTable!);
                    }}
                    className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                  >
                    Thử lại
                  </button>
                </div>
              ) : currentTable?.dishes?.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500 animate-fade-in">
                  <div className="animate-bounce mb-4">🍽️</div>
                  Chưa có món ăn nào. Nhấn "Thực đơn" để thêm món.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {currentTable?.dishes?.map((d, i) => (
                    <DishCard
                      key={d.id}
                      dish={{
                        id: d.id,
                        dishId: d.dishId,
                        image: d.image,
                        quantity: d.quantity,
                        status: d.status,
                        dishName: d.dishName,
                        name: d.dishName,
                        price: d.price,
                        unit: d.unit,
                        note: d.note,
                        tableId: selTable || "",
                      }}
                      index={i}
                      isSelected={selDish === d.id}
                      onSelect={setSelDish}
                      onDelete={delDish}
                      onQuantityChange={handleQuantityChange}
                      onStatusToggle={toggleStatus}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t-2 border-orange-200 shrink-0">
              <button
                onClick={recordPaymentRequestTime}
                disabled={currentTable?.dishes?.length === 0}
                className={`bg-white border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-lg font-medium hover:bg-orange-50 animate-bounce-in flex flex-col items-center ${currentTable?.dishes?.length === 0 ? " opacity-50 cursor-not-allowed" : ""}`}
              >
                Yêu cầu thanh toán
              </button>

              <button
                onClick={payRequest}
                disabled={currentTable?.dishes?.length === 0}
                className={`bg-orange-500 text-white px-6 py-3 rounded-lg font-bold text-lg animate-fade-in hover:bg-orange-600 ${currentTable?.dishes?.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Tổng: {total.toLocaleString()}.VND
              </button>
            </div>
          </div>
        ) : (<TableMenu
          currentTable={currentTable}
          menuItems={menuItems}
          dishError={dishError}
          setDishError={setDishError}
          fetchMenuItems={fetchMenuItems}
          addToCart={addToCart}
          backFromMenu={backFromMenu}
        />)}

      </div>

      {
        selTable && (
          <div className="w-80 bg-white border-l-2 border-gray-200 p-4 flex flex-col h-full shrink-0">
            {isMenuView ? (
              <CartSidebar
                cart={cart}
                onQuantityChange={updateCartQty}
                onAddToTable={addCartToTable}
                onNoteChange={updateCartNote}
              />
            ) : (
              <NotificationSidebar
                notifications={notifs}
                tableId={selTable}
                onCallOrder={updateUncalledDishes}
              />
            )}
          </div>
        )
      }

      {
        showDelNotif && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in-from-right hover:scale-105">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 animate-bounce" />
              <span>{notifMessage}</span>
            </div>
          </div>
        )
      }

      <Dialog open={showAddTable} onOpenChange={() => {
        setShowAddTable(false);
        setNewTable({ name: "", tableTypeId: selectedTableType || "", maxPerson: "", note: "" });
        setAddTableError(null);
      }}>
        <DialogContent className="bg-orange-50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-orange-600">Thêm bàn mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4" >
            <div>
              <label className="block text-sm font-medium text-gray-700">Loại bàn</label>
              <Select
                value={newTable.tableTypeId || selectedTableType || undefined}
                onValueChange={(value) => setNewTable({ ...newTable, tableTypeId: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại bàn" />
                </SelectTrigger>
                <SelectContent>
                  {tableTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                  <SelectSeparator />
                  <div className="px-2 py-1">
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2 rounded bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold transition"
                      onClick={() => setShowAddType(true)}
                    >
                      <Plus className="w-4 h-4" /> Thêm loại bàn
                    </button>
                  </div>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên bàn</label>
              <Input
                value={newTable.name}
                onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                placeholder="Nhập tên bàn (ví dụ: Bàn 11)"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Số lượng người tối đa</label>
              <Input
                type="number"
                value={newTable.maxPerson}
                onChange={(e) => setNewTable({ ...newTable, maxPerson: e.target.value })}
                placeholder="Nhập số lượng người"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
              <Input
                value={newTable.note}
                onChange={(e) => setNewTable({ ...newTable, note: e.target.value })}
                placeholder="Nhập ghi chú (nếu có)"
                className="w-full"
              />
            </div>
            {addTableError && (
              <p className="text-red-500 text-sm">{addTableError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowAddTable(false);
                setNewTable({ name: "", tableTypeId: selectedTableType || "", maxPerson: "", note: "" });
                setAddTableError(null);
              }}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Hủy
            </Button>
            <Button
              onClick={addTable}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              Thêm bàn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {
        showAddType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-80 flex flex-col items-center ">
              <div className="text-lg font-bold text-orange-700 mb-4">Thêm loại bàn mới</div>
              <input
                type="text"
                value={newTypeName}
                onChange={e => setNewTypeName(e.target.value)}
                placeholder="Nhập tên loại bàn"
                className="w-full px-3 py-2 border rounded mb-4 focus:ring-2 focus:ring-orange-200"
                maxLength={30}
                autoFocus
              />
              <div className="flex gap-2 w-full">
                <button
                  className="flex-1 px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-50"
                  onClick={handleAddTableType}
                  disabled={!newTypeName.trim()}
                >
                  Thêm
                </button>
                <button
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                  onClick={() => setShowAddType(false)}
                >
                  Huỷ
                </button>
              </div>
            </div>
          </div>
        )
      }

      <PaymentDialog
        isOpen={showPay}
        onClose={closePay}
        table={currentTable}
        payMethod={payMethod}
        showPayOpt={showPayOpt}
        qrUrl={qrUrl}
        onConfirmPay={confirmPay}
        onSelectPayMethod={selectPayMethod}

        total={total}
      />
    </div >
  );
};

export default TableGrid;
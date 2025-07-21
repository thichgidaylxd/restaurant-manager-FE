import React from "react";
import { ArrowLeft } from "lucide-react";
import { DishType, Dish } from "@/types/dish";
import MenuCard from "./MenuCard"; // Đường dẫn tuỳ theo cấu trúc của bạn
import { MenuService } from "@/services/menuService";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, Plus, Tag, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import axiosInstance from "@/config/axios";


interface TableMenuProps {
    currentTable?: { name: string };
    menuItems: Dish[];
    dishError: string | null;
    backFromMenu: () => void;
    setDishError: (err: string | null) => void;
    fetchMenuItems: () => void;
    addToCart: (item: Dish) => void;
}

const TableMenu: React.FC<TableMenuProps> = ({
    currentTable,
    menuItems,
    dishError,
    backFromMenu,
    setDishError,
    fetchMenuItems,
    addToCart
}) => {

    const [dishes, setDishes] = useState<Dish[]>([]);
    const [dishTypes, setDishTypes] = useState<DishType[]>([]);
    const [selectedDishType, setSelectedDishType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [showAddDishType, setShowAddDishType] = useState(false);
    const [newDishTypeName, setNewDishTypeName] = useState("");
    const [addingType, setAddingType] = useState(false);

    useEffect(() => {
        const fetchDishTypes = async () => {
            try {
                const response = await MenuService.getAllDishTypes();
                console.log("Dish types API response:", JSON.stringify(response, null, 2));
                setDishTypes(response.data || []);
            } catch (err: any) {
                setError(err.message || "Lỗi khi lấy danh sách loại món");
            }
        };
        fetchDishTypes();
    }, []);

    // ⬇ Cập nhật dishes khi menuItems thay đổi
    useEffect(() => {
        setDishes(menuItems);
    }, [menuItems]);

    const filteredDishes = dishes.filter((dish) => {
        const matchesSearch = search === "" || dish.name.toLowerCase().includes(search.toLowerCase());
        const matchesType = selectedDishType === null || dish.dishType.id === selectedDishType;
        return matchesSearch && matchesType;
    });

    // Handler cập nhật và xóa món
    const handleEditDish = (dish: Dish) => {
      // TODO: mở form cập nhật, truyền dữ liệu dish vào form (triển khai sau)
      toast({ title: `Cập nhật món: ${dish.name}` });
    };
    const handleDeleteDish = async (dish: Dish) => {
      if (!window.confirm(`Bạn có chắc muốn xóa món '${dish.name}'?`)) return;
      try {
        const res = await axiosInstance.delete(`/dishes/${dish.id}`);
        if (res.data && res.data.code === 200) {
          toast({ title: "Đã xóa món thành công!" });
          fetchMenuItems();
        } else {
          toast({ title: "Xóa món thất bại!", variant: "destructive" });
        }
      } catch {
        toast({ title: "Lỗi khi xóa món!", variant: "destructive" });
      }
    };


    return (
        <div className="w-full bg-orange-50 p-6 rounded-lg flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-orange-200 shrink-0">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={backFromMenu}
                        className="p-2 rounded-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-50 animate-bounce-in"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg border-2 border-orange-300">
                        <h1 className="text-xl font-bold">{currentTable?.name || "N/A"}</h1>
                    </div>
                    <div className="pl-44 flex items-center gap-4">
                        <Select
                            value={selectedDishType || "all"}
                            onValueChange={(value) => setSelectedDishType(value === "all" ? null : value)}
                        >
                            <SelectTrigger className="w-[180px] hover:shadow-lg border-orange-400 transition-all  text-orange-500 duration-300 hover-glow">
                                <SelectValue placeholder="Tất cả loại món" />
                            </SelectTrigger>
                            <SelectContent className="animate-zoom-in">
                                <SelectItem
                                    value="all"
                                    className="hover:bg-orange-100 transition-colors duration-200"
                                >
                                    Tất cả loại món
                                </SelectItem>
                                {dishTypes.map((type) => (
                                    <SelectItem
                                        key={type.id}
                                        value={type.id}
                                        className="hover:bg-orange-100 transition-colors duration-200"
                                    >
                                        {type.name}
                                    </SelectItem>
                                ))}
                                <div className="px-2 py-1">
                                  <button
                                    type="button"
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold transition"
                                    onClick={() => setShowAddDishType(true)}
                                  >
                                    <Plus className="w-4 h-4" /> Thêm loại món
                                  </button>
                                </div>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center border border-orange-200 rounded-full px-4 py-0 mr-8 bg-white shadow-sm">
                            <Search className="w-5 h-5 text-orange-300 mr-2" />
                            <Input
                                placeholder="Tìm món ăn"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border-0 shadow-none focus:ring-0 px-0 py-0 text-gray-700 placeholder:text-orange-300 bg-transparent w-32 md:w-48"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {dishError ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="text-6xl mb-4 text-red-500">⚠️</div>
                            <p className="text-red-600 font-medium text-lg">{dishError}</p>
                            <button
                                onClick={() => {
                                    setDishError(null);
                                    fetchMenuItems();
                                }}
                                className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                            >
                                Thử lại
                            </button>
                        </div>
                    </div>
                ) : menuItems.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🍽️</div>
                            <p className="text-gray-600 font-medium text-lg">
                                Chưa có món ăn nào. Nhấn "Tải thực đơn" để lấy danh sách món.
                            </p>
                            <button
                                onClick={() => {
                                    setDishError(null);
                                    fetchMenuItems();
                                }}
                                className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                            >
                                Tải thực đơn
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {filteredDishes.map((item, i) => (
                            <MenuCard
                              key={item.id}
                              item={item}
                              index={i}
                              onAddToCart={addToCart}
                              onEdit={handleEditDish}
                              onDelete={handleDeleteDish}
                            />
                        ))}

                    </div>
                )}
            </div>
            {showAddDishType && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-80 flex flex-col items-center ">
                  <div className="text-lg font-bold text-orange-700 mb-4">Thêm loại món mới</div>
                  <input
                    type="text"
                    value={newDishTypeName}
                    onChange={e => setNewDishTypeName(e.target.value)}
                    placeholder="Nhập tên loại món"
                    className="w-full px-3 py-2 border rounded mb-4 focus:ring-2 focus:ring-orange-200"
                    maxLength={30}
                    autoFocus
                  />
                  <div className="flex gap-2 w-full">
                    <button
                      className="flex-1 px-4 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-50"
                      onClick={async () => {
                        if (!newDishTypeName.trim()) return;
                        setAddingType(true);
                        try {
                          const res = await axiosInstance.post("/dish-types", { name: newDishTypeName });
                          if (res.data && res.data.code === 200) {
                            toast({ title: "Thêm loại món thành công!" });
                            setShowAddDishType(false);
                            setNewDishTypeName("");
                            // reload dishTypes
                            const response = await MenuService.getAllDishTypes();
                            setDishTypes(response.data || []);
                          } else {
                            toast({ title: "Thêm loại món thất bại!", variant: "destructive" });
                          }
                        } catch {
                          toast({ title: "Lỗi khi thêm loại món!", variant: "destructive" });
                        } finally {
                          setAddingType(false);
                        }
                      }}
                      disabled={!newDishTypeName.trim() || addingType}
                    >
                      Thêm
                    </button>
                    <button
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                      onClick={() => setShowAddDishType(false)}
                    >
                      Huỷ
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
    );
};

export default TableMenu;

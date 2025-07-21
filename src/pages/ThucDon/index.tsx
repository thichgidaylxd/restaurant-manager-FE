import React, { useState, useEffect } from "react";
import { Menu, Plus, Tag, Search, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from "@/components/layout/Sidebar";
import { MenuService } from "@/services/menuService";
import { Dish, DishType } from "@/types/dish";
import { toast } from "@/components/ui/use-toast";

const ThucDon = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [dishTypes, setDishTypes] = useState<DishType[]>([]);
  const [selectedDishType, setSelectedDishType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Form states
  const [showAddDish, setShowAddDish] = useState(false);
  const [newDish, setNewDish] = useState({
    name: "",
    dishTypeId: "",
    price: "",
    unit: "",
    note: "",
    image: null as File | null,
    imagePreview: ""
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddType, setShowAddType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [isAddingType, setIsAddingType] = useState(false);

  // State cho sửa món
  const [showEditDish, setShowEditDish] = useState(false);
  const [editDish, setEditDish] = useState<Dish | null>(null);
  const [editDishData, setEditDishData] = useState({
    name: "",
    dishTypeId: "",
    price: "",
    unit: "",
    note: "",
    image: "",
    imageFile: null as File | null,
    imagePreview: ""
  });
  const [editFormError, setEditFormError] = useState("");
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

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

  useEffect(() => {
    const fetchDishes = async () => {
      setLoading(true);
      setError("");
      try {
        const response = selectedDishType
          ? await MenuService.getMenuItemsByType(selectedDishType)
          : await MenuService.getAllMenuItems();
        console.log("Dishes API response:", JSON.stringify(response, null, 2));
        setDishes(response.data || []);
      } catch (err: any) {
        setError(err.message || "Lỗi khi lấy danh sách món ăn");
      } finally {
        setLoading(false);
      }
    };
    fetchDishes();
  }, [selectedDishType]);

  const filteredDishes = dishes.filter((dish) =>
    search === "" || dish.name.toLowerCase().includes(search.toLowerCase())
  );

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setFormError("Chỉ hỗ trợ file ảnh: JPG, PNG, GIF");
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setFormError("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setNewDish({
          ...newDish,
          image: file,
          imagePreview: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
      setFormError("");
    }
  };

  // Remove image
  const removeImage = () => {
    setNewDish({
      ...newDish,
      image: null,
      imagePreview: ""
    });
  };

  // Convert image to base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!newDish.name.trim()) {
      setFormError("Vui lòng nhập tên món");
      return;
    }
    if (!newDish.dishTypeId) {
      setFormError("Vui lòng chọn loại món");
      return;
    }
    if (!newDish.price || isNaN(parseFloat(newDish.price)) || parseFloat(newDish.price) <= 0) {
      setFormError("Vui lòng nhập giá hợp lệ");
      return;
    }
    if (!newDish.unit.trim()) {
      setFormError("Vui lòng nhập đơn vị");
      return;
    }
    if (!newDish.image) {
      setFormError("Vui lòng chọn ảnh món");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const selectedType = dishTypes.find(type => type.id === newDish.dishTypeId);
      if (!selectedType) {
        throw new Error("Loại món không hợp lệ");
      }

      const imageBase64 = await convertImageToBase64(newDish.image);

      const dishData = {
        dishType: {
          id: newDish.dishTypeId,
          name: selectedType.name
        },
        name: newDish.name.trim(),
        price: parseFloat(newDish.price),
        unit: newDish.unit.trim(),
        note: newDish.note.trim() || null,
        image: imageBase64
      };

      await MenuService.createDish(dishData);

      // Refresh dishes list
      const response = selectedDishType
        ? await MenuService.getMenuItemsByType(selectedDishType)
        : await MenuService.getAllMenuItems();
      setDishes(response.data || []);

      // Reset form
      setNewDish({
        name: "",
        dishTypeId: "",
        price: "",
        unit: "",
        note: "",
        image: null,
        imagePreview: ""
      });
      setShowAddDish(false);
      toast({ title: "Thêm món thành công!" });
    } catch (err: any) {
      setFormError(err.message || "Lỗi khi thêm món");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle add new dish type
  const handleAddDishType = async () => {
    if (!newTypeName.trim()) {
      toast({ title: "Vui lòng nhập tên loại món", variant: "destructive" });
      return;
    }

    setIsAddingType(true);
    try {
      const response = await MenuService.createDishType(newTypeName.trim());
      if (response.data) {
        // Refresh dish types
        const typesResponse = await MenuService.getAllDishTypes();
        setDishTypes(typesResponse.data || []);

        // Auto-select the newly created type
        const newType = typesResponse.data?.find((type: DishType) => type.name === newTypeName.trim());
        if (newType) {
          setNewDish({ ...newDish, dishTypeId: newType.id });
        }

        setNewTypeName("");
        setShowAddType(false);
        toast({ title: "Thêm loại món thành công!" });
      }
    } catch (err: any) {
      toast({ title: err.message || "Lỗi khi thêm loại món", variant: "destructive" });
    } finally {
      setIsAddingType(false);
    }
  };

  // Hàm mở dialog sửa
  const openEditDish = (dish: Dish) => {
    setEditDish(dish);
    setEditDishData({
      name: dish.name,
      dishTypeId: dish.dishType.id,
      price: dish.price.toString(),
      unit: dish.unit,
      note: dish.note || "",
      image: dish.image,
      imageFile: null,
      imagePreview: dish.image ? `data:image/jpg;base64,${dish.image}` : ""
    });
    setEditFormError("");
    setShowEditDish(true);
  };

  // Hàm upload ảnh cho sửa
  const handleEditImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setEditFormError("Chỉ hỗ trợ file ảnh: JPG, PNG, GIF");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setEditFormError("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditDishData((prev) => ({ ...prev, imageFile: file, imagePreview: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
      setEditFormError("");
    }
  };

  const removeEditImage = () => {
    setEditDishData((prev) => ({ ...prev, imageFile: null, imagePreview: "", image: "" }));
  };

  // Hàm submit cập nhật món
  const handleEditSubmit = async () => {
    if (!editDishData.name.trim()) {
      setEditFormError("Vui lòng nhập tên món");
      return;
    }
    if (!editDishData.dishTypeId) {
      setEditFormError("Vui lòng chọn loại món");
      return;
    }
    if (!editDishData.price || isNaN(parseFloat(editDishData.price)) || parseFloat(editDishData.price) <= 0) {
      setEditFormError("Vui lòng nhập giá hợp lệ");
      return;
    }
    if (!editDishData.unit.trim()) {
      setEditFormError("Vui lòng nhập đơn vị");
      return;
    }
    setIsEditSubmitting(true);
    setEditFormError("");
    try {
      let imageBase64 = editDishData.image;
      if (editDishData.imageFile) {
        imageBase64 = await convertImageToBase64(editDishData.imageFile);
      }
      const selectedType = dishTypes.find(type => type.id === editDishData.dishTypeId);
      if (!selectedType) throw new Error("Loại món không hợp lệ");
      const updateData = {
        dishType: { id: editDishData.dishTypeId, name: selectedType.name },
        name: editDishData.name.trim(),
        price: parseFloat(editDishData.price),
        unit: editDishData.unit.trim(),
        note: editDishData.note.trim() || null,
        image: imageBase64
      };
      await MenuService.updateDish(editDish!.id, updateData);
      toast({ title: "Cập nhật món thành công!" });
      // Reload lại danh sách
      const response = selectedDishType
        ? await MenuService.getMenuItemsByType(selectedDishType)
        : await MenuService.getAllMenuItems();
      setDishes(response.data || []);
      setShowEditDish(false);
      setEditDish(null);
    } catch (err: any) {
      setEditFormError(err.message || "Lỗi khi cập nhật món");
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Reset form when dialog closes
  const handleCloseDialog = () => {
    setShowAddDish(false);
    setNewDish({
      name: "",
      dishTypeId: "",
      price: "",
      unit: "",
      note: "",
      image: null,
      imagePreview: ""
    });
    setFormError("");
  };

  return (
    <div className="table-grid-container flex w-full h-screen bg-orange-50 text-foreground">

      {/* Sidebar */}
      <Sidebar />
      <div className="w-full mx-5 my-5 rounded-2xl shadow-2xl bg-white/90 p-0 overflow-hidden relative border border-orange-100">

        {/* Header */}
        <div className="flex items-center justify-between px-2 pt-2 pb-4">
          <div className="flex items-center gap-3">
            <Menu className="w-8 h-8 text-orange-500" />
            <span className="text-3xl font-bold text-orange-600 select-none">Quản lý thực đơn</span>
          </div>
          <div className="flex items-center gap-4">
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
        {/* Danh sách món ăn */}
        <div className="px-8 pb-4 max-h-[560px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading && <p className="text-gray-700">Đang tải...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && filteredDishes.length === 0 && <p className=" text-orange-700 text-center">Không có món ăn</p>}
          {filteredDishes.map((dish, idx) => (
            <div key={idx} className="flex items-center bg-white border border-orange-100 rounded-2xl shadow-md px-6 py-4 gap-4">
              {/* Cột 1: Ảnh + tên + giá */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img
                  src={`data:image/jpg;base64,${dish.image}`}
                  className="w-16 h-16 rounded-lg border-2 border-orange-200 object-cover group-hover:scale-110"
                />
                <div>
                  <div className="font-bold text-lg text-gray-800 mb-1">{dish.name}</div>
                  <div className="text-sm text-gray-500">
                    Đơn giá: <span className="font-semibold">{dish.price.toLocaleString()} VND</span>
                  </div>
                </div>
              </div>
              {/* Cột 2: Phân loại */}
              <div className="flex flex-col gap-2 flex-1 min-w-0 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4 text-orange-300" />
                  Phân loại món: <span className="text-gray-700 font-medium ml-1">{dish.dishType.name}</span>
                </span>
              </div>
              {/* Cột 3: Nút sửa/xóa */}
              <div className="flex items-center gap-3">
                <button
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => openEditDish(dish)}
                  title="Cập nhật món"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
                </button>
                <button
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={async () => {
                    if (window.confirm(`Bạn có chắc muốn xóa món '${dish.name}'?`)) {
                      try {
                        const res = await MenuService.deleteDish(dish.id);
                        if (res && res.data && res.data.code === 200) {
                          toast({ title: "Đã xóa món thành công!" });
                          // Reload lại danh sách
                          const response = selectedDishType
                            ? await MenuService.getMenuItemsByType(selectedDishType)
                            : await MenuService.getAllMenuItems();
                          setDishes(response.data || []);
                        } else {
                          toast({ title: "Xóa món thất bại!", variant: "destructive" });
                        }
                      } catch {
                        toast({ title: "Lỗi khi xóa món!", variant: "destructive" });
                      }
                    }
                  }}
                  title="Xóa món"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Add Dish Button */}
        <div className="flex items-center px-2 pt-4">
          <Button
            onClick={() => setShowAddDish(true)}
            className="flex items-center gap-2 font-semibold text-lg shadow-lg bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 py-3"
          >
            <Plus className="w-6 h-6" />
            Thêm món ăn mới
          </Button>
        </div>
        {/* Add Dish Dialog */}
        <Dialog open={showAddDish} onOpenChange={handleCloseDialog}>
          <DialogContent className="bg-orange-50 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-orange-600">Thêm món ăn mới</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Ảnh món ăn *</label>
                <div className="flex items-center justify-center w-full">
                  {newDish.imagePreview ? (
                    <div className="relative group">
                      <img
                        src={newDish.imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-orange-200 shadow-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removeImage}
                          className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-orange-300 border-dashed rounded-lg cursor-pointer bg-orange-50 hover:bg-orange-100 transition-all duration-200 hover:border-orange-400 hover:shadow-md">
                      <Upload className="w-8 h-8 text-orange-400 mb-2" />
                      <span className="text-sm text-orange-600 font-medium">Chọn ảnh</span>
                      <span className="text-xs text-orange-500">Click để upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500">Hỗ trợ: JPG, PNG, GIF. Tối đa 5MB</p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tên món ăn <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newDish.name}
                    onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                    placeholder="Nhập tên món ăn"
                    className="w-full focus:ring-orange-500 focus:border-orange-500"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Loại món <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={newDish.dishTypeId}
                    onValueChange={(value) => setNewDish({ ...newDish, dishTypeId: value })}
                  >
                    <SelectTrigger className="w-full focus:ring-orange-500 focus:border-orange-500">
                      <SelectValue placeholder="Chọn loại món" />
                    </SelectTrigger>
                    <SelectContent>
                      {dishTypes.map((type) => (
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
                          <Plus className="w-4 h-4" /> Thêm loại món
                        </button>
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Giá (VND) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={newDish.price}
                    onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                    placeholder="Nhập giá món"
                    className="w-full focus:ring-orange-500 focus:border-orange-500"
                    min="0"
                    step="1000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Đơn vị <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newDish.unit}
                    onChange={(e) => setNewDish({ ...newDish, unit: e.target.value })}
                    placeholder="Ví dụ: phần, đĩa, ly"
                    className="w-full focus:ring-orange-500 focus:border-orange-500"
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Ghi chú (tùy chọn)</label>
                <Textarea
                  value={newDish.note}
                  onChange={(e) => setNewDish({ ...newDish, note: e.target.value })}
                  placeholder="Nhập ghi chú về món ăn (nếu có)"
                  className="w-full focus:ring-orange-500 focus:border-orange-500 resize-none"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 text-right">
                  {newDish.note.length}/200 ký tự
                </p>
              </div>

              {formError && (
                <p className="text-red-500 text-sm">{formError}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={handleCloseDialog}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-orange-500 text-white hover:bg-orange-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang thêm..." : "Thêm món"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Dish Type Dialog */}
        <Dialog open={showAddType} onOpenChange={() => {
          setShowAddType(false);
          setNewTypeName("");
        }}>
          <DialogContent className="bg-orange-50 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-orange-600">Thêm loại món mới</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên loại món</label>
                <Input
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="Nhập tên loại món"
                  className="w-full"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddDishType();
                    }
                  }}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => {
                  setShowAddType(false);
                  setNewTypeName("");
                }}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                disabled={isAddingType}
              >
                Hủy
              </Button>
              <Button
                onClick={handleAddDishType}
                className="bg-orange-500 text-white hover:bg-orange-600"
                disabled={isAddingType}
              >
                {isAddingType ? "Đang thêm..." : "Thêm loại món"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog sửa món */}
        <Dialog open={showEditDish} onOpenChange={() => setShowEditDish(false)}>
          <DialogContent className="bg-orange-50 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-orange-600">Cập nhật món ăn</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Ảnh món ăn</label>
                <div className="flex items-center justify-center w-full">
                  {editDishData.imagePreview ? (
                    <div className="relative group">
                      <img
                        src={editDishData.imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-orange-200 shadow-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removeEditImage}
                          className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) :
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-orange-300 border-dashed rounded-lg cursor-pointer bg-orange-50 hover:bg-orange-100 transition-all duration-200 hover:border-orange-400 hover:shadow-md">
                      <Upload className="w-8 h-8 text-orange-400 mb-2" />
                      <span className="text-sm text-orange-600 font-medium">Chọn ảnh</span>
                      <span className="text-xs text-orange-500">Click để upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        className="hidden"
                      />
                    </label>
                  }
                </div>
                <p className="text-xs text-gray-500">Hỗ trợ: JPG, PNG, GIF. Tối đa 5MB</p>
              </div>
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tên món ăn <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={editDishData.name}
                    onChange={(e) => setEditDishData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Nhập tên món ăn"
                    className="w-full focus:ring-orange-500 focus:border-orange-500"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Loại món <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={editDishData.dishTypeId}
                    onValueChange={(value) => setEditDishData((prev) => ({ ...prev, dishTypeId: value }))}
                  >
                    <SelectTrigger className="w-full focus:ring-orange-500 focus:border-orange-500">
                      <SelectValue placeholder="Chọn loại món" />
                    </SelectTrigger>
                    <SelectContent>
                      {dishTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Giá (VND) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={editDishData.price}
                    onChange={(e) => setEditDishData((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="Nhập giá món"
                    className="w-full focus:ring-orange-500 focus:border-orange-500"
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Đơn vị <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={editDishData.unit}
                    onChange={(e) => setEditDishData((prev) => ({ ...prev, unit: e.target.value }))}
                    placeholder="Ví dụ: phần, đĩa, ly"
                    className="w-full focus:ring-orange-500 focus:border-orange-500"
                    maxLength={20}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Ghi chú (tùy chọn)</label>
                <Textarea
                  value={editDishData.note}
                  onChange={(e) => setEditDishData((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Nhập ghi chú về món ăn (nếu có)"
                  className="w-full focus:ring-orange-500 focus:border-orange-500 resize-none"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 text-right">
                  {editDishData.note.length}/200 ký tự
                </p>
              </div>
              {editFormError && (
                <p className="text-red-500 text-sm">{editFormError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={() => setShowEditDish(false)}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                disabled={isEditSubmitting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleEditSubmit}
                className="bg-orange-500 text-white hover:bg-orange-600"
                disabled={isEditSubmitting}
              >
                {isEditSubmitting ? "Đang cập nhật..." : "Cập nhật món"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Custom scrollbar style */}
        <style>{`
        .scrollbar-thin { scrollbar-width: thin; }
        .scrollbar-thumb-orange-400::-webkit-scrollbar-thumb { background: #fb923c !important; border-radius: 8px; }
        .scrollbar-thumb-orange-400::-webkit-scrollbar { background: transparent; width: 8px; }
        .scrollbar-thumb-orange-400::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thumb-orange-400 { scrollbar-color: #fb923c #fff0e5; }
        .hover-glow { transition: box-shadow 0.3s ease; }
        .hover-glow:hover { box-shadow: 0 0 10px rgba(251, 146, 60, 0.5); }
        .animate-zoom-in { animation: zoomIn 0.2s ease-out; }
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
      </div>
    </div>
  );
};

export default ThucDon;
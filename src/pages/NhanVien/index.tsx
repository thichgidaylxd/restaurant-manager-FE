import React, { useEffect, useState } from "react";
import { Menu, Plus, User, Phone, MapPin, Calendar, Filter, Briefcase } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Form, FormItem, FormLabel, FormControl, FormField, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/layout/Sidebar";
import { UserService } from "@/services/userService";
import type { Employee } from "@/types/user";
import { useForm } from "react-hook-form";
import { useRef } from "react";

const NhanVien = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [positions, setPositions] = useState<{ id: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [roleName, setRoleName] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await UserService.getAllEmployees();
        setEmployees(res.data || res || []);
      } catch (err: any) {
        setError(err.message || "Lỗi khi lấy danh sách nhân viên");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await UserService.getAllPositions();
        setPositions(res.data || res || []);
      } catch {}
    };
    fetchPositions();
  }, []);

  const fetchRoles = async () => {
    setRoleLoading(true);
    setRoleError("");
    try {
      const res = await UserService.getAllPositions();
      setRoles(res.data || res || []);
    } catch (err: any) {
      setRoleError(err.message || "Lỗi khi lấy danh sách chức vụ");
    } finally {
      setRoleLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = async () => {
    if (!roleName.trim()) return;
    try {
      await UserService.createPosition(roleName.trim());
      setRoleName("");
      fetchRoles();
    } catch (err: any) {
      alert(err.message || "Lỗi khi thêm chức vụ");
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chức vụ này?")) return;
    try {
      await UserService.deletePosition(id);
      fetchRoles();
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa chức vụ");
    }
  };

  const form = useForm({ defaultValues: {
    employeeName: "",
    positionId: "",
    image: undefined,
    address: "",
    phoneNumber: "",
    birthDate: "",
  }});

  const onSubmit = async (values: any) => {
    try {
      let imageBase64 = "";
      if (values.image && values.image.length > 0) {
        const file = values.image[0];
        imageBase64 = await toBase64(file);
      }
      await UserService.createEmployee({
        ...values,
        image: imageBase64,
      });
      setShowAdd(false);
      form.reset();
      // reload employees
      const res = await UserService.getAllEmployees();
      setEmployees(res.data || res || []);
    } catch (err: any) {
      alert(err.message || "Lỗi khi thêm nhân viên");
    }
  };

  function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  const editForm = useForm({ defaultValues: {
    id: "",
    employeeName: "",
    positionId: "",
    image: undefined,
    address: "",
    phoneNumber: "",
    birthDate: "",
  }});

  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    editForm.reset({
      id: emp.id,
      employeeName: emp.employeeName,
      positionId: emp.positionId,
      image: undefined,
      address: emp.address,
      phoneNumber: emp.phoneNumber,
      birthDate: emp.birthDate,
    });
    setShowEdit(true);
  };

  const onEditSubmit = async (values: any) => {
    try {
      let imageBase64 = editingEmployee?.image || "";
      if (values.image && values.image.length > 0) {
        const file = values.image[0];
        imageBase64 = await toBase64(file);
      }
      await UserService.updateEmployee({
        ...values,
        image: imageBase64,
      });
      setShowEdit(false);
      setEditingEmployee(null);
      // reload employees
      const res = await UserService.getAllEmployees();
      setEmployees(res.data || res || []);
    } catch (err: any) {
      alert(err.message || "Lỗi khi cập nhật nhân viên");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) return;
    try {
      await UserService.deleteEmployee(id);
      // reload employees
      const res = await UserService.getAllEmployees();
      setEmployees(res.data || res || []);
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa nhân viên");
    }
  };

  return (
    <div className="table-grid-container flex w-full h-screen bg-orange-50 text-foreground">
      <Sidebar />
      <div className="flex-1 max-w-4xl mx-auto rounded-2xl shadow-2xl bg-white/90 p-0 overflow-hidden relative border border-orange-100">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <Menu className="w-8 h-8 text-orange-500" />
          <span className="text-3xl font-bold text-orange-600 select-none">Quản lý nhân viên</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-orange-200 rounded-full px-4 py-2 bg-white shadow-sm">
            <svg className="w-5 h-5 text-orange-300 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <Input placeholder="Tìm nhân viên" className="border-0 shadow-none focus:ring-0 px-0 py-0 text-gray-700 placeholder:text-orange-300 bg-transparent w-32 md:w-48" />
          </div>
          <Button variant="outline" className="rounded-full border-orange-200 text-orange-500 font-semibold flex items-center gap-1 px-4 py-2 bg-white hover:bg-orange-50">
            <Filter className="w-5 h-5" />
            Lọc
          </Button>
        </div>
      </div>
      {/* Danh sách nhân viên */}
      <div className="px-8 pb-4 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent flex flex-col gap-4">
        {loading && <div>Đang tải...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && employees.length === 0 && <div>Không có nhân viên</div>}
        {employees.map((emp, idx) => (
          <div key={emp.id || idx} className="flex items-center bg-white border border-white rounded-2xl shadow-md px-6 py-4 gap-4">
            {/* Cột 1: Avatar + tên + chức vụ */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <img src={emp.image} alt="avatar" className="w-16 h-16 rounded-xl bg-orange-100 object-cover border border-orange-100" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-5 h-5 text-orange-400" />
                  <span className="font-bold text-lg text-orange-600">{emp.employeeName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-orange-400">
                  <span className="font-semibold flex items-center gap-1"><Briefcase className="w-4 h-4" />Chức vụ:</span>
                  <span className="text-orange-500 font-medium">{emp.positionName}</span>
                </div>
              </div>
            </div>
            {/* Cột 2: Số điện thoại + địa chỉ */}
            <div className="flex flex-col gap-2 flex-1 min-w-0 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-orange-300" />Số điện thoại: <span className="text-gray-700 font-medium ml-1">{emp.phoneNumber}</span></span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-orange-300" />Địa chỉ: <span className="text-gray-700 font-medium ml-1">{emp.address}</span></span>
            </div>
            {/* Cột 3: Ngày sinh */}
            <div className="flex flex-col gap-2 flex-1 min-w-0 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-orange-300" />Ngày sinh: <span className="text-gray-700 font-medium ml-1">{emp.birthDate}</span></span>
            </div>
            {/* Cột 4: Hành động */}
            <div className="flex flex-col gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(emp)}>Sửa</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(emp.id)}>Xóa</Button>
            </div>
          </div>
        ))}
      </div>
      {/* Add Employee Button */}
      <div className="flex items-center px-8 pb-8 pt-4">
        <Button className="flex items-center gap-2 font-semibold text-lg shadow-lg bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 py-3" onClick={() => setShowAdd(true)}>
          <Plus className="w-6 h-6" />
          Thêm nhân viên
        </Button>
      </div>
      {/* Quản lý chức vụ */}
      <div className="px-8 pb-8 pt-4">
        <div className="mb-2 text-lg font-bold text-orange-700">Quản lý chức vụ</div>
        <div className="flex gap-2 mb-4">
          <Input value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="Tên chức vụ mới" className="w-64" />
          <Button onClick={handleAddRole}>Thêm chức vụ</Button>
        </div>
        {roleLoading && <div>Đang tải...</div>}
        {roleError && <div className="text-red-600">{roleError}</div>}
        <div className="flex flex-wrap gap-2">
          {roles.map(role => (
            <div key={role.id} className="flex items-center gap-2 bg-orange-100 rounded-lg px-3 py-1">
              <span className="font-medium text-orange-700">{role.name}</span>
              <Button size="sm" variant="destructive" onClick={() => handleDeleteRole(role.id)}>Xóa</Button>
            </div>
          ))}
        </div>
      </div>
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField name="employeeName" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ tên</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="positionId" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Chức vụ</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Chọn chức vụ" /></SelectTrigger>
                      <SelectContent>
                        {positions.map(pos => (
                          <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="image" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Ảnh đại diện</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" ref={fileInputRef} onChange={e => field.onChange(e.target.files)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="address" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="phoneNumber" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="birthDate" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày sinh</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Hủy</Button>
                <Button type="submit">Thêm</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-lg w-full">
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField name="employeeName" control={editForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ tên</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="positionId" control={editForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Chức vụ</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Chọn chức vụ" /></SelectTrigger>
                      <SelectContent>
                        {positions.map(pos => (
                          <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="image" control={editForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Ảnh đại diện</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={e => field.onChange(e.target.files)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="address" control={editForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="phoneNumber" control={editForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="birthDate" control={editForm.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày sinh</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>Hủy</Button>
                <Button type="submit">Cập nhật</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Custom scrollbar style */}
      <style>{`
        .scrollbar-thin { scrollbar-width: thin; }
        .scrollbar-thumb-orange-400::-webkit-scrollbar-thumb { background: #fb923c !important; border-radius: 8px; }
        .scrollbar-thumb-orange-400::-webkit-scrollbar { background: transparent; width: 8px; }
        .scrollbar-thumb-orange-400::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thumb-orange-400 { scrollbar-color: #fb923c #fff0e5; }
      `}</style>
      </div>
    </div>
  );
};

export default NhanVien;

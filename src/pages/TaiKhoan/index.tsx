import React, { useEffect, useState } from "react";
import { Menu, Plus } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { AuthService } from "@/services/authService";
import { toast } from "@/components/ui/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import { User, Role } from "@/types/user";
import { UserService } from "@/services/userService";

const mockData = Array.from({ length: 12 }).map((_, i) => ({
  name: "Loại tài khoản",
  phone: "Số điện thoại",
  role: "Quyền",
  createdAt: "Ngày tạo",
}));

const TaiKhoan = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    userAccount: "",
    userAccountName: "",
    role: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch users (giả lập)
    setUsers([
      { id: "1", account: "user1", accountName: "User 1", role: "Quản trị viên", createdAt: "2023-01-01" },
      { id: "2", account: "user2", accountName: "User 2", role: "Nhân viên", createdAt: "2023-02-01" },
      { id: "3", account: "user3", accountName: "User 3", role: "Khách hàng", createdAt: "2023-03-01" },
    ]);

    // Fetch roles from service
    UserService.getRoles().then(res => {
      if (res && res.code === 200) {
        setRoles(res.data);
      }
    }).catch(err => {
      console.error("Failed to fetch roles:", err);
    });
  }, []);

  const handleChange = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    if (!form.userAccount || !form.userAccountName || !form.role || !form.password || !form.confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    setLoading(true);
    const res = await AuthService.register({
      account: form.userAccount,
      accountName: form.userAccountName,
      role: form.role,
      password: form.password,
      confirmPassword: form.confirmPassword
    });
    setLoading(false);
    if (res.success) {
      toast({ title: "Thêm tài khoản thành công!" });
      setShowAdd(false);
      setForm({ userAccount: "", userAccountName: "", role: "", password: "", confirmPassword: "" });
      // Thêm vào danh sách (giả lập, thực tế nên reload từ API)
      setUsers(users => [
        { id: Date.now().toString(), account: form.userAccount, accountName: form.userAccountName, role: roles.find(r => r.id === form.role)?.name || "", createdAt: new Date().toLocaleDateString() },
        ...users
      ]);
    } else {
      setError(res.message || "Thêm tài khoản thất bại!");
    }
  };

  return (
    <div className="table-grid-container flex w-full h-screen bg-orange-50 text-foreground">
      <Sidebar />
      <div className="flex-1 max-w-5xl mx-auto rounded-2xl shadow-2xl bg-white/90 p-0 overflow-hidden relative border border-orange-100">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <Menu className="w-8 h-8 text-orange-500" />
          <span className="text-2xl md:text-3xl font-bold text-orange-700 select-none">Quản lý tài khoản</span>
        </div>
        <div className="w-64 max-w-full flex items-center border rounded-md px-2 bg-white shadow-sm">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <Input placeholder="Tìm tài khoản" className="border-0 shadow-none focus:ring-0 px-0 py-2 text-gray-700 placeholder:text-gray-400 bg-transparent" />
        </div>
      </div>
      {/* Table */}
      <div className="px-8 pb-4 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent">
        <Table>
          <TableHeader>
            <TableRow className="bg-orange-500 text-white rounded-t-lg">
              <TableHead className="text-white font-semibold bg-orange-500 first:rounded-tl-lg last:rounded-tr-lg">Họ và tên</TableHead>
              <TableHead className="text-white font-semibold bg-orange-500">Số điện thoại</TableHead>
              <TableHead className="text-white font-semibold bg-orange-500">Quyền</TableHead>
              <TableHead className="text-white font-semibold bg-orange-500">Ngày tạo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, idx) => (
              <TableRow key={user.id} className="bg-white border-b last:rounded-b-lg">
                <TableCell>{user.accountName}</TableCell>
                <TableCell>{user.account}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Add Account Button */}
      <div className="flex items-center px-8 pb-6 pt-2">
        <Button
          className="flex items-center gap-2 font-semibold text-base shadow-md bg-orange-600 hover:bg-orange-700 text-white"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-5 h-5" />
          Thêm tài khoản
        </Button>
      </div>
      {/* Dialog thêm tài khoản */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-orange-600">Thêm tài khoản mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên tài khoản</label>
              <Input value={form.userAccount} onChange={e => handleChange("userAccount", e.target.value)} placeholder="Nhập tên tài khoản" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
              <Input value={form.userAccountName} onChange={e => handleChange("userAccountName", e.target.value)} placeholder="Nhập họ và tên" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quyền</label>
              <Select value={form.role} onValueChange={v => handleChange("role", v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn quyền" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <Input type="password" value={form.password} onChange={e => handleChange("password", e.target.value)} placeholder="Nhập mật khẩu" className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
              <Input type="password" value={form.confirmPassword} onChange={e => handleChange("confirmPassword", e.target.value)} placeholder="Nhập lại mật khẩu" className="w-full" />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAdd(false)} className="bg-gray-300 text-gray-700 hover:bg-gray-400">Huỷ</Button>
            <Button onClick={handleSubmit} className="bg-orange-500 text-white hover:bg-orange-600" disabled={loading}>
              {loading ? "Đang thêm..." : "Thêm tài khoản"}
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
      `}</style>
      </div>
    </div>
  );
};

export default TaiKhoan;

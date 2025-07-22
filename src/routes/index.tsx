import { Routes, Route, Navigate } from "react-router-dom";
import Table from "@/pages/Table";
import HoaDon from "@/pages/HoaDon";
import ThucDon from "@/pages/ThucDon";
import DoanhThu from "@/pages/DoanhThu";
import NhanVien from "@/pages/NhanVien";
import TaiKhoan from "@/pages/TaiKhoan";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Logout from "@/pages/Logout/Logout";
import DatBan from "@/pages/DatBan";
import NotFoundPage from "@/pages/NotFoundPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";


// App Router - Main routing configuration

const AppRoutes = () => {
  return (
    <Routes>
      {/* All routes are now public - no authentication required */}
      <Route path="/" element={<Home />} />
      <Route path="/datban" element={
        ProtectedRoute({ allowedRoles: ["Người quản lý"], children: <DatBan /> })
      } />
      <Route path="/table" element={ProtectedRoute({ allowedRoles: ["Người quản lý", "Nhân viên", "Nhân viên bếp", "Nhân viên thu ngân"], children: <Table /> })} />
      {/* <Route path="/" element={<Table />} /> */}
      <Route path="/logout" element={<Logout />} />
      <Route path="/hoadon" element={ProtectedRoute({ allowedRoles: ["Người quản lý", "Nhân viên"], children: <HoaDon /> })} />
      <Route path="/thucdon" element={ProtectedRoute({ allowedRoles: ["Người quản lý"], children: <ThucDon /> })} />
      <Route path="/doanhthu" element={ProtectedRoute({ allowedRoles: ["Người quản lý"], children: <DoanhThu /> })} />
      <Route path="/nhanvien" element={ProtectedRoute({ allowedRoles: ["Người quản lý"], children: <NhanVien /> })} />
      <Route path="/taikhoan" element={ProtectedRoute({ allowedRoles: ["Người quản lý"], children: <TaiKhoan /> })} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;

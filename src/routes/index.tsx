import { Routes, Route } from "react-router-dom";
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
import CustomerPage from "@/pages/KhachHang/khachhang";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/logout" element={<Logout />} />

      {/* Protected Routes */}
      <Route
        path="/table"
        element={
          <ProtectedRoute allowedRoles={["Người quản lý", "Nhân viên", "Nhân viên bếp", "Nhân viên thu ngân"]}>
            <Table />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ghinhandatban"
        element={
          <ProtectedRoute allowedRoles={["Người quản lý"]}>
            <DatBan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices"
        element={
          <ProtectedRoute allowedRoles={["Người quản lý", "Nhân viên", "Nhân viên thu ngân", "Nhân viên bếp"]}>
            <HoaDon />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dishes"
        element={
          <ProtectedRoute allowedRoles={["Người quản lý"]}>
            <ThucDon />
          </ProtectedRoute>
        }
      />

      <Route
        path="/revenue"
        element={
          <ProtectedRoute allowedRoles={["Người quản lý"]}>
            <DoanhThu />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={["Người quản lý"]}>
            <NhanVien />
          </ProtectedRoute>
        }
      />

      <Route
        path="/account"
        element={
          <ProtectedRoute allowedRoles={["Người quản lý"]}>
            <TaiKhoan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={["Khách hàng"]}>
            <CustomerPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;

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


// App Router - Main routing configuration

const AppRoutes = () => {
  return (
    <Routes>
      {/* All routes are now public - no authentication required */}
      <Route path="/datban" element={<DatBan />} />
      <Route path="/" element={<Table />} />
      <Route path="/table" element={<Table />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/hoadon" element={<HoaDon />} />
      <Route path="/thucdon" element={<ThucDon />} />
      <Route path="/doanhthu" element={<DoanhThu />} />
      <Route path="/nhanvien" element={<NhanVien />} />
      <Route path="/taikhoan" element={<TaiKhoan />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Catch all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

import React from "react";
import { useLocation } from "react-router-dom";

// Icon và hình ảnh nhà hàng
const logoUrl = "https://cdn-icons-png.flaticon.com/512/3075/3075977.png"; // chef
const tableIcon = "https://cdn-icons-png.flaticon.com/512/3075/3075972.png";
const foodIcon = "https://cdn-icons-png.flaticon.com/512/3075/3075974.png";
const dishIcon = "https://cdn-icons-png.flaticon.com/512/1046/1046857.png";
const restaurantIcon = "https://cdn-icons-png.flaticon.com/512/3075/3075976.png";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-52 bg-orange-50 border-r border-orange-200 flex flex-col h-screen min-h-screen relative overflow-hidden">
      {/* Logo và tên nhà hàng */}
      <div className="flex flex-col items-center pt-7 pb-2 select-none">
        <img src={logoUrl} alt="logo" className="w-16 h-16 rounded-full shadow-lg border-4 border-orange-200 bg-white object-cover mb-2 animate-fade-in" />
        <span className="text-xl font-extrabold text-orange-700 tracking-wide drop-shadow mb-2">NHÀ HÀNG</span>
        {/* Hàng ngang icon trang trí nhỏ */}
        <div className="flex flex-row gap-3 justify-center items-center mb-2 mt-1 opacity-70">
          <img src={tableIcon} alt="table" className="w-6 h-6" />
          <img src={foodIcon} alt="food" className="w-6 h-6" />
          <img src={dishIcon} alt="dish" className="w-6 h-6" />
          <img src={restaurantIcon} alt="restaurant" className="w-6 h-6" />
        </div>
      </div>
      <div className="p-4">
        <div
          onClick={() => (window.location.href = "/table")}
          className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 cursor-pointer transition-colors duration-200 ${isActive("/table")
              ? "bg-orange-200 text-orange-800 hover:bg-orange-300"
              : "text-gray-600 hover:bg-orange-100"
            }`}
        >
          <span>📁</span>
          <span>Bàn ăn</span>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {[
          { path: "/hoadon", label: "Hóa đơn", icon: "📋" },
          { path: "/thucdon", label: "Thực đơn", icon: "🍽️" },
          { path: "/doanhthu", label: "Doanh thu", icon: "💰" },
          { path: "/nhanvien", label: "Nhân viên", icon: "👥" },
          { path: "/taikhoan", label: "Tài khoản", icon: "👤" },
        ].map(({ path, label, icon }) => (
          <div
            key={path}
            onClick={() => (window.location.href = path)}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${isActive(path)
                ? "bg-orange-200 text-orange-800 hover:bg-orange-300"
                : "text-gray-600 hover:bg-orange-100"
              }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-orange-200 mt-auto">
        <div
          onClick={() => (window.location.href = "/caidat")}
          className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${isActive("/caidat")
              ? "bg-orange-200 text-orange-800 hover:bg-orange-300"
              : "text-gray-600 hover:bg-orange-100"
            }`}
        >
          <span>⚙️</span>
          <span>Cài đặt</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

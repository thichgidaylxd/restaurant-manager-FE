import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getUserRole } from "@/utils/auth";

// Icon URL
const logoUrl = "https://cdn-icons-png.flaticon.com/512/3075/3075977.png";
const tableIcon = "https://cdn-icons-png.flaticon.com/512/3075/3075972.png";
const foodIcon = "https://cdn-icons-png.flaticon.com/512/3075/3075974.png";
const dishIcon = "https://cdn-icons-png.flaticon.com/512/1046/1046857.png";
const restaurantIcon = "https://cdn-icons-png.flaticon.com/512/3075/3075976.png";

const Sidebar = () => {
  const location = useLocation();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getUserRole());
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const commonLinks = [
    { path: "/table", label: "Bàn ăn", icon: "📁" },
    { path: "/invoices", label: "Hóa đơn", icon: "📋" }
  ];

  const managerLinks = [
    { path: "/dishes", label: "Thực đơn", icon: "🍽️" },
    { path: "/revenue", label: "Doanh thu", icon: "💰" },
    { path: "/employee", label: "Nhân viên", icon: "👥" },
    { path: "/account", label: "Tài khoản", icon: "👤" },
    { path: "/ordered-tables", label: "Đặt bàn", icon: "🍽️" }

  ];

  // sau này triển khai trang cài đặt
  const settingsLink = { path: "/logout", label: "Cài đặt", icon: "⚙️" };

  return (
    <div className="w-52 bg-orange-50 border-r border-orange-200 flex flex-col h-screen min-h-screen overflow-hidden">
      <div className="flex flex-col items-center pt-7 pb-2 select-none">
        <img src={logoUrl} alt="logo" className="w-16 h-16 rounded-full shadow-lg border-4 border-orange-200 bg-white object-cover mb-2 animate-fade-in" />
        <span className="text-xl font-extrabold text-orange-700 tracking-wide drop-shadow mb-2">NHÀ HÀNG</span>
        <div className="flex gap-3 justify-center items-center mb-2 mt-1 opacity-70">
          {[tableIcon, foodIcon, dishIcon, restaurantIcon].map((src, i) => (
            <img key={i} src={src} alt="icon" className="w-6 h-6" />
          ))}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {[...commonLinks, ...(role === "Người quản lý" ? managerLinks : [])].map(({ path, label, icon }) => (
          <div
            key={path}
            onClick={() => (window.location.href = path)}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${isActive(path) ? "bg-orange-200 text-orange-800 hover:bg-orange-300" : "text-gray-600 hover:bg-orange-100"
              }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-orange-200 mt-auto">
        <div
          onClick={() => (window.location.href = settingsLink.path)}
          className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${isActive(settingsLink.path) ? "bg-orange-200 text-orange-800 hover:bg-orange-300" : "text-gray-600 hover:bg-orange-100"
            }`}
        >
          <span>{settingsLink.icon}</span>
          <span>{settingsLink.label}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

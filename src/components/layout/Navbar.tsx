import React from "react";
import { AuthService } from "@/services/authService";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const isAuthenticated = AuthService.isAuthenticated();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/logout");
  };

  return (
    <nav className="bg-orange-500 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold">Restaurant Management</h1>
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="bg-white text-orange-500 px-4 py-2 rounded font-semibold hover:bg-orange-100 transition"
          >
            Đăng xuất
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

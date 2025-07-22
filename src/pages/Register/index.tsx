import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/authService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { FaPhoneAlt, FaLock, FaUser } from "react-icons/fa";

const Register = () => {
  const [accountName, setAccountName] = useState("");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Mật khẩu không khớp!", variant: "destructive" });
      return;
    }
    setLoading(true);
    const roleId = null;
    const res = await AuthService.register({ accountName, account, roleId, password, confirmPassword }); // Giả sử backend nhận phone là email
    setLoading(false);
    if (res.success) {
      toast({ title: "Đăng ký thành công!", description: "Bạn có thể đăng nhập ngay bây giờ." });
      navigate("/login");
    } else {
      toast({ title: res.message || "Đăng ký thất bại!", variant: "destructive" });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(255, 247, 237, 0.92) 0%, rgba(255, 236, 200, 0.85) 100%), url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1500&q=80') center center/cover no-repeat fixed`,
        backgroundBlendMode: 'overlay',
      }}
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,237,213,0.7) 0%, rgba(253,186,116,0.10) 100%)' }} />
      <Card className="flex w-full max-w-3xl shadow-2xl overflow-hidden rounded-2xl z-10 p-0">
        {/* Cột trái: illustration, logo, lời chào, nút trở lại */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-orange-50 relative p-8">
          <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="Logo Chef" className="w-16 h-16 mb-4 drop-shadow-lg" />
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2">
            <ellipse cx="90" cy="90" rx="80" ry="60" fill="#FDBA74" fillOpacity="0.13" />
            <ellipse cx="90" cy="110" rx="60" ry="30" fill="#F59E42" fillOpacity="0.10" />
            <path d="M60 120 Q 90 80 120 120" stroke="#FDBA74" strokeWidth="4" fill="none" />
            <circle cx="90" cy="90" r="18" fill="#fff" stroke="#FDBA74" strokeWidth="3" />
            <ellipse cx="90" cy="90" rx="8" ry="12" fill="#FDBA74" />
          </svg>
          {/* Hình ảnh nhỏ dưới illustration */}
          <img src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" alt="Food Icon" className="w-10 h-10 mb-4" />
          <h2 className="text-3xl font-bold text-orange-700 mb-2">Chào mừng!</h2>
          <p className="mb-6 text-orange-600">Cảm ơn bạn, đồng hành cùng chúng tôi nhé!</p>
          <button
            type="button"
            className="w-full py-2 rounded bg-orange-400 text-white font-semibold hover:bg-orange-500 transition"
            onClick={() => navigate("/login")}
          >
            ← Trở lại
          </button>
        </div>
        {/* Cột phải: form đăng ký */}
        <div className="flex-1 bg-white p-10 flex flex-col justify-center">
          <form onSubmit={handleRegister}>
            <h2 className="text-2xl font-bold text-center mb-6 text-orange-800">Đăng ký tài khoản</h2>
            <div className="mb-4 relative">
              <Input
                type="text"
                placeholder="Họ và tên"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                className="pl-10 bg-gray-100"
                required
              />
              <FaUser className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="mb-4 relative">
              <Input
                type="text"
                placeholder="Số điện thoại"
                value={account}
                onChange={e => setAccount(e.target.value)}
                className="pl-10 bg-gray-100"
                required
              />
              <FaPhoneAlt className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="mb-4 relative">
              <Input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10 bg-gray-100"
                required
              />
              <FaLock className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="mb-4 relative">
              <Input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="pl-10 bg-gray-100"
                required
              />
              <FaLock className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button
              type="submit"
              className="w-full mt-2 py-2 rounded bg-orange-400 text-white font-semibold hover:bg-orange-500 transition"
            >
              {"Đăng ký"}
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Register; 
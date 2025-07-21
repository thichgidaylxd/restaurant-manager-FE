import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "@/services/authService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { FaPhoneAlt, FaLock } from "react-icons/fa";


const Login = () => {

  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token != null) {
      navigate("/");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await AuthService.login({ account, password });
    setLoading(false);
    if (res.success) {
      toast({ title: "Đăng nhập thành công!" });
      navigate("/");
    } else {
      toast({ title: res.message || "Đăng nhập thất bại!", variant: "destructive" });
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
      < Card className="flex w-full max-w-3xl shadow-2xl overflow-hidden rounded-2xl z-10 p-0" >
        {/* Cột trái: illustration, logo, lời chào, nút đăng ký */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-orange-50 relative p-8" >
          <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="Logo Chef" className="w-16 h-16 mb-4 drop-shadow-lg" />
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
            <ellipse cx="90" cy="90" rx="80" ry="60" fill="#FDBA74" fillOpacity="0.13" />
            <ellipse cx="90" cy="110" rx="60" ry="30" fill="#F59E42" fillOpacity="0.10" />
            <path d="M60 120 Q 90 80 120 120" stroke="#FDBA74" strokeWidth="4" fill="none" />
            <circle cx="90" cy="90" r="18" fill="#fff" stroke="#FDBA74" strokeWidth="3" />
            <ellipse cx="90" cy="90" rx="8" ry="12" fill="#FDBA74" />
          </svg>
          <h2 className="text-3xl font-bold text-orange-700 mb-2">Xin chào!</h2>
          <p className="mb-6 text-orange-600">Bạn chưa có tài khoản?</p>
          <button
            type="button"
            className="w-full py-2 rounded bg-orange-400 text-white font-semibold hover:bg-orange-500 transition"
            onClick={() => navigate("/register")}
          >
            Đăng ký tài khoản
          </button>
        </div >
        {/* Cột phải: form đăng nhập */}
        < div className="flex-1 bg-white p-10 flex flex-col justify-center" >
          <form onSubmit={handleLogin}>
            <h2 className="text-2xl font-bold text-center mb-6 text-orange-800">Đăng nhập</h2>
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
            <div className="mb-4 text-right text-sm text-gray-500 cursor-pointer hover:underline">Quên mật khẩu?</div>
            <Button type="submit" className="w-full bg-orange-400 hover:bg-orange-500" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </ div>
      </Card >
    </div >
  );
};

export default Login; 
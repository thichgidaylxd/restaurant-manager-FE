import { useEffect } from "react";
import { AuthService } from "@/services/authService";
import { useNavigate } from "react-router-dom";

const restaurantBg = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1500&q=80";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        AuthService.logout(); // xử lý logout + redirect bên trong
    }, []);

    return (
        <div
            className="flex justify-center items-center h-screen text-lg font-medium relative overflow-hidden"
            style={{
                background: `linear-gradient(135deg, rgba(255, 247, 237, 0.92) 0%, rgba(255, 236, 200, 0.85) 100%), url('${restaurantBg}') center center/cover no-repeat fixed`,
                backgroundBlendMode: 'overlay',
            }}
        >
            {/* Overlay gradient */}
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,237,213,0.7) 0%, rgba(253,186,116,0.10) 100%)' }} />
            <span className="relative z-10">Đang đăng xuất...</span>
        </div>
    );
};

export default Logout;

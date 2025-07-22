import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import { FaUtensils } from "react-icons/fa";

const Home = () => {
  return (
    <div className="table-grid-container flex w-full h-screen bg-orange-50 text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col items-stretch overflow-auto">
        {/* Banner lớn */}
        <div className="relative w-full h-[400px] md:h-[480px] flex items-center justify-center rounded-b-3xl overflow-hidden shadow-xl border-b-8 border-orange-300">
          <img
            src="/intro.png"
            alt="Banner nhà hàng"
            className="absolute inset-0 w-full h-full object-cover object-center z-0 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/80 via-yellow-200/60 to-orange-100/80 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-20" />
          <div className="relative z-30 flex flex-col items-center justify-center w-full h-full text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide mb-4 drop-shadow-lg uppercase animate-fade-in">Ẩm Thực Việt - Nhà Hàng Đẳng Cấp</h1>
            <div className="text-lg md:text-2xl font-semibold mb-4 drop-shadow animate-fade-in delay-100">Trải nghiệm ẩm thực tuyệt vời, không gian sang trọng, phục vụ tận tâm</div>
            <a href="#datban" className="inline-flex items-center gap-2 bg-white/90 text-orange-600 font-bold px-8 py-3 rounded-full text-lg shadow-lg hover:bg-orange-500 hover:text-white transition mb-2 animate-fade-in delay-200">
              <FaUtensils className="text-xl" /> Đặt bàn ngay
            </a>
          </div>
        </div>
        {/* Phần giới thiệu */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-12 px-6 bg-white">
          <div className="flex-1 max-w-xl text-center md:text-left bg-orange-50/80 rounded-2xl shadow-xl p-8 border border-orange-100 animate-fade-in-up">
            <h2 className="text-2xl md:text-3xl font-bold text-orange-700 mb-4 uppercase tracking-wider">Chào mừng quý khách!</h2>
            <p className="text-gray-700 text-base md:text-lg mb-4">
              Nhà hàng Ẩm Thực Việt tự hào mang đến cho quý khách những món ăn tinh hoa từ khắp mọi miền đất nước, được chế biến bởi đầu bếp giàu kinh nghiệm.<br/>
              Đặt bàn, gọi món, thanh toán online tiện lợi, không gian lý tưởng cho gia đình, bạn bè và đối tác.
            </p>
            <div className="flex flex-col gap-2 text-base text-gray-700 mt-6">
              <span className="font-semibold text-orange-600">Thông tin liên hệ:</span>
              <span>Địa chỉ: 123 Đường Ẩm Thực, Quận Hải Châu, Đà Nẵng</span>
              <span>Hotline: 0901 234 567</span>
              <span>Email: info@amthucviet.vn</span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center max-w-md animate-fade-in-up delay-100">
            <img src="/intro.png" alt="Ẩm thực nhà hàng" className="rounded-2xl shadow-2xl w-full h-auto object-cover border-4 border-orange-200" />
          </div>
        </div>
        {/* Hiệu ứng animation CSS */}
        <style>{`
          @keyframes fade-in { from { opacity: 0; transform: translateY(16px);} to { opacity: 1; transform: none; } }
          .animate-fade-in { animation: fade-in 0.8s cubic-bezier(.4,0,.2,1) both; }
          .animate-fade-in-up { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
        `}</style>
      </div>
    </div>
  );
};

export default Home; 
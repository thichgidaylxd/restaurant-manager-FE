import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockBookings = Array.from({ length: 8 }).map((_, i) => ({
  phone: "Số điện thoại",
  table: "Số bàn",
  date: "Ngày",
  time: "Giờ",
  note: "Ghi chú",
}));

const DatBan = () => {
  return (
    <div className="max-w-4xl mx-auto rounded-2xl shadow-2xl bg-white/90 p-0 overflow-hidden relative border border-orange-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-8 pt-8 pb-4">
        <Menu className="w-8 h-8 text-orange-500" />
        <span className="text-3xl font-bold text-orange-600 select-none">Ghi nhận đặt bàn</span>
      </div>
      {/* Bảng đặt bàn */}
      <div className="px-8 pb-4 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-blue-500 text-white rounded-t-lg">
              <th className="py-3 px-2 font-semibold text-white">Số điện thoại</th>
              <th className="py-3 px-2 font-semibold text-white">Số bàn</th>
              <th className="py-3 px-2 font-semibold text-white">Ngày</th>
              <th className="py-3 px-2 font-semibold text-white">Giờ</th>
              <th className="py-3 px-2 font-semibold text-white">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {mockBookings.map((row, idx) => (
              <tr key={idx} className="bg-white border-b border-gray-300 last:rounded-b-lg">
                <td className="py-3 px-2 text-center border border-gray-200">{row.phone}</td>
                <td className="py-3 px-2 text-center border border-gray-200">{row.table}</td>
                <td className="py-3 px-2 text-center border border-gray-200">{row.date}</td>
                <td className="py-3 px-2 text-center border border-gray-200">{row.time}</td>
                <td className="py-3 px-2 text-center border border-gray-200 flex flex-col md:flex-row items-center gap-2 justify-center">
                  <span>{row.note}</span>
                  <Button className="bg-pink-100 text-pink-700 hover:bg-pink-200 rounded-md px-3 py-1 text-sm font-semibold border border-pink-200">Từ chối</Button>
                  <Button className="bg-blue-500 text-white hover:bg-blue-600 rounded-md px-3 py-1 text-sm font-semibold">Xác nhận</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Custom scrollbar style */}
      <style>{`
        .scrollbar-thin { scrollbar-width: thin; }
        .scrollbar-thumb-orange-400::-webkit-scrollbar-thumb { background: #fb923c !important; border-radius: 8px; }
        .scrollbar-thumb-orange-400::-webkit-scrollbar { background: transparent; width: 8px; }
        .scrollbar-thumb-orange-400::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thumb-orange-400 { scrollbar-color: #fb923c #fff0e5; }
      `}</style>
    </div>
  );
};

export default DatBan; 
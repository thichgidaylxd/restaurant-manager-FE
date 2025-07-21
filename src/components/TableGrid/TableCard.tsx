import React from "react";
import { Card } from "@/components/ui/card";
import { RestaurantTable } from "@/types/table";

interface TableCardProps {
  table: RestaurantTable;
  index: number;
  onClick: (table: RestaurantTable) => void;
  onDelete?: (table: RestaurantTable) => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, index, onClick, onDelete }) => {
  const getStatusDisplay = () => {
    switch (table.status) {
      case "Trống":
        return { text: table.status, bgColor: "bg-green-500", textColor: "text-white" };
      case "Đang sử dụng":
        return { text: table.status, bgColor: "bg-red-500", textColor: "text-white" };
      case "Chờ thanh toán":
        return { text: table.status, bgColor: "bg-orange-500", textColor: "text-white" }; // Giả định, API chỉ trả "Trống" hiện tại
    };// Giả định, API chỉ trả "Trống" hiện tại
  };

  const status = getStatusDisplay();

  // State cho long press
  const [showDelete, setShowDelete] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    timerRef.current = setTimeout(() => setShowDelete(true), 600); // 600ms long press
  };
  const handleMouseUp = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  const handleTouchStart = () => {
    timerRef.current = setTimeout(() => setShowDelete(true), 600);
  };
  const handleTouchEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div
      className="relative animate-fade-in-up transform hover:scale-105 transition-all duration-300 hover-lift"
      style={{ animationDelay: `${index * 0.05}s` }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="border-4 border-indigo-900 rounded-xl bg-white cursor-pointer hover:shadow-2xl transition-all duration-300 hover:rotate-1 group hover-glow animate-float"
        onClick={() => {
          onClick(table);
          window.history.pushState(null, "", `/banan/${table.id}`);
        }}
        style={{ animationDelay: `${index * 0.2}s` }}
      >
        <div className="p-4 flex flex-col items-center justify-center h-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-yellow-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient"></div>

          <div className="relative z-10 text-lg font-bold mb-2 text-gray-800 group-hover:text-indigo-900 transition-colors duration-300 animate-heartbeat">
            {table.name}
          </div>
          <div
            className={`relative z-10 px-4 py-2 rounded-full text-sm font-semibold ${status.bgColor} ${status.textColor} shadow-md transform group-hover:scale-110 transition-all duration-300 animate-bounce-in`}
            style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
          >
            {status.text}
            {table.status === "Trống" && (
              <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping"></div>
            )}
          </div>
          {/* Icon xóa hiện khi long press */}
          {showDelete && (
            <button
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 z-20 animate-bounce-in"
              onClick={e => {
                e.stopPropagation();
                setShowDelete(false);
                onDelete && onDelete(table);
              }}
              title="Xóa bàn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <div className="h-2 bg-indigo-900 rounded-b-lg group-hover:bg-gradient-to-r group-hover:from-indigo-900 group-hover:via-purple-600 group-hover:to-pink-500 transition-all duration-500 animate-gradient"></div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
        </div>
        <div className="absolute bottom-4 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div
            className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TableCard;
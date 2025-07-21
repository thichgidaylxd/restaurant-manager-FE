import React from "react";
import { Bell } from "lucide-react";
import { Notification } from "@/types/dish";
import { useState } from "react";
import axiosInstance from "@/config/axios";
import dayjs from "dayjs";

interface NotificationSidebarProps {
  notifications: Notification[];
  tableId: string;
  onCallOrder: () => void;
}

const NotificationSidebar: React.FC<NotificationSidebarProps> = ({
  notifications,
  tableId,
  onCallOrder,
}) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tableNotifications = notifications
    .filter((n) => n.tableId === tableId)
    .sort((a, b) => b.timestamp - a.timestamp);


  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4 mb-4 flex-1 overflow-auto animate-slide-in-from-right">
        <h2 className="text-lg font-bold text-orange-600 mb-3 flex items-center">
          <Bell className="w-5 h-5 mr-2 animate-bounce" />
          Thông báo
        </h2>
        <div className="space-y-3">
          {tableNotifications.map((n, i) => (
            <div
              key={n.id}
              className="flex items-start space-x-2 animate-slide-in-from-right"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <div className="w-2 h-2 rounded-full mt-2 bg-orange-500"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{n.dishName || n.status || "Thông báo"}</p>
                <p className="text-xs text-gray-500">{dayjs(n.timestamp).format("HH:mm DD/MM/YYYY")}</p>
              </div>
            </div>
          ))}
          {!tableNotifications.length && (
            <p className="text-sm text-gray-500 text-center py-4">
              Chưa có thông báo nào
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <button
          className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-50"
        >
          Gọi món
        </button>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default NotificationSidebar;
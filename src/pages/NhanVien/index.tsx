import React from "react";
import { Menu, Plus, User, Phone, MapPin, Calendar, Filter, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/layout/Sidebar";

const mockEmployees = [
  {
    name: "Tên nhân viên",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=An",
    position: "Phục vụ",
    phone: "0903xxx333",
    address: "Đà Nẵng",
    dob: "dd/MM/yyyy",
    added: "dd/MM/yyyy",
  },
  {
    name: "Tên nhân viên",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Binh",
    position: "Phục vụ",
    phone: "0903xxx333",
    address: "Đà Nẵng",
    dob: "dd/MM/yyyy",
    added: "dd/MM/yyyy",
  },
  {
    name: "Tên nhân viên",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cuong",
    position: "Phục vụ",
    phone: "0903xxx333",
    address: "Đà Nẵng",
    dob: "dd/MM/yyyy",
    added: "dd/MM/yyyy",
  },
  {
    name: "Tên nhân viên",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dung",
    position: "Phục vụ",
    phone: "0903xxx333",
    address: "Đà Nẵng",
    dob: "dd/MM/yyyy",
    added: "dd/MM/yyyy",
  },
];

const NhanVien = () => {
  return (
    <div className="table-grid-container flex w-full h-screen bg-orange-50 text-foreground">
      <Sidebar />
      <div className="flex-1 max-w-4xl mx-auto rounded-2xl shadow-2xl bg-white/90 p-0 overflow-hidden relative border border-orange-100">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <Menu className="w-8 h-8 text-orange-500" />
          <span className="text-3xl font-bold text-orange-600 select-none">Quản lý nhân viên</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-orange-200 rounded-full px-4 py-2 bg-white shadow-sm">
            <svg className="w-5 h-5 text-orange-300 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <Input placeholder="Tìm nhân viên" className="border-0 shadow-none focus:ring-0 px-0 py-0 text-gray-700 placeholder:text-orange-300 bg-transparent w-32 md:w-48" />
          </div>
          <Button variant="outline" className="rounded-full border-orange-200 text-orange-500 font-semibold flex items-center gap-1 px-4 py-2 bg-white hover:bg-orange-50">
            <Filter className="w-5 h-5" />
            Lọc
          </Button>
        </div>
      </div>
      {/* Danh sách nhân viên */}
      <div className="px-8 pb-4 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent flex flex-col gap-4">
        {mockEmployees.map((emp, idx) => (
          <div key={idx} className="flex items-center bg-white border border-white rounded-2xl shadow-md px-6 py-4 gap-4">
            {/* Cột 1: Avatar + tên + chức vụ */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <img src={emp.avatar} alt="avatar" className="w-16 h-16 rounded-xl bg-orange-100 object-cover border border-orange-100" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-5 h-5 text-orange-400" />
                  <span className="font-bold text-lg text-orange-600">{emp.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-orange-400">
                  <span className="font-semibold flex items-center gap-1"><Briefcase className="w-4 h-4" />Chức vụ:</span>
                  <span className="text-orange-500 font-medium">{emp.position}</span>
                </div>
              </div>
            </div>
            {/* Cột 2: Số điện thoại + địa chỉ */}
            <div className="flex flex-col gap-2 flex-1 min-w-0 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-orange-300" />Số điện thoại: <span className="text-gray-700 font-medium ml-1">{emp.phone}</span></span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-orange-300" />Địa chỉ: <span className="text-gray-700 font-medium ml-1">{emp.address}</span></span>
            </div>
            {/* Cột 3: Ngày sinh + ngày thêm */}
            <div className="flex flex-col gap-2 flex-1 min-w-0 text-sm text-gray-600">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-orange-300" />Ngày sinh: <span className="text-gray-700 font-medium ml-1">{emp.dob}</span></span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-orange-300" />Ngày thêm: <span className="text-gray-700 font-medium ml-1">{emp.added}</span></span>
            </div>
          </div>
        ))}
      </div>
      {/* Add Employee Button */}
      <div className="flex items-center px-8 pb-8 pt-4">
        <Button className="flex items-center gap-2 font-semibold text-lg shadow-lg bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 py-3">
          <Plus className="w-6 h-6" />
          Thêm nhân viên
        </Button>
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
    </div>
  );
};

export default NhanVien;

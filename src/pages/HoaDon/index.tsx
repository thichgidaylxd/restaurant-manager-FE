import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Search, Receipt, Eye } from "lucide-react";
import { InvoiceService } from "@/services/InvoiceService";
import type { Invoice, InvoiceDish } from "@/types/invoice";
import Sidebar from "@/components/layout/Sidebar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const HoaDon = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      setError("");
      try {
        let res;
        if (selectedDate) {
          const dateStr = format(selectedDate, "yyyy-MM-dd");
          res = await InvoiceService.getAllInvoicesByDate(dateStr);
        } else {
          res = await InvoiceService.getAllInvoices();
        }
        setInvoices(res.data || []);
      } catch (err: any) {
        setError(err.message || "Lỗi khi lấy danh sách hóa đơn");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, [selectedDate]);

  const exportToPDF = (invoice: Invoice) => {
    const doc = new jsPDF();

    // Tiêu đề
    doc.setFontSize(18);
    doc.text("Chi Tiết Hóa Đơn", 14, 20);

    // Thông tin hóa đơn
    doc.setFontSize(12);
    doc.text(`Mã hóa đơn: ${invoice.invoiceId}`, 14, 30);
    doc.text(`Bàn: ${invoice.tableName}`, 14, 38);
    doc.text(`Người tạo: ${invoice.userAccountName || "N/A"}`, 14, 46);
    doc.text(`Trạng thái: ${invoice.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}`, 14, 54);

    // Bảng món ăn
    autoTable(doc, {
      startY: 62,
      head: [["Tên món", "Số lượng", "Đơn giá (VND)", "Thành tiền (VND)"]],
      body: invoice.invoiceDishResponses?.map(item => [
        item.dishName || "N/A",
        item.quantity || 0,
        (item.price || 0).toLocaleString(),
        ((item.price || 0) * (item.quantity || 0)).toLocaleString()
      ]) || [],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [255, 165, 0] },
    });
  }

  const filteredInvoices = invoices.filter(
    (inv: Invoice) =>
      (statusFilter === "all" || (statusFilter === "paid" ? inv.status === "paid" : inv.status !== "paid")) &&
      (search === "" || inv.invoiceId.toLowerCase().includes(search.toLowerCase()) || inv.tableName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="table-grid-container flex w-full h-screen bg-orange-50 text-foreground">

      {/* Sidebar */}
      <Sidebar />
      <div className="min-h-screen bg-orange-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header + Filter */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <h1 className="text-3xl font-bold text-orange-800">Quản lý hóa đơn</h1>
            <div className="flex gap-2 items-center flex-wrap">
              <button onClick={() => setStatusFilter("all")} className={`px-4 py-2 rounded-lg font-medium border transition ${statusFilter === "all" ? "bg-orange-500 text-white" : "bg-white text-orange-600 border-orange-200 hover:bg-orange-100"}`}>Tất cả</button>
              <button onClick={() => setStatusFilter("paid")} className={`px-4 py-2 rounded-lg font-medium border transition ${statusFilter === "paid" ? "bg-orange-500 text-white" : "bg-white text-orange-600 border-orange-200 hover:bg-orange-100"}`}>Đã thanh toán</button>
              <button onClick={() => setStatusFilter("unpaid")} className={`px-4 py-2 rounded-lg font-medium border transition ${statusFilter === "unpaid" ? "bg-orange-500 text-white" : "bg-white text-orange-600 border-orange-200 hover:bg-orange-100"}`}>Chưa thanh toán</button>
              <div className="relative">
                <button
                  className={`px-4 py-2 rounded-lg font-medium border bg-white text-orange-600 border-orange-200 hover:bg-orange-100 flex items-center gap-2 ${selectedDate ? 'ring-2 ring-orange-400' : ''}`}
                  onClick={() => setShowCalendar((v) => !v)}
                  type="button"
                >
                  <CalendarIcon className="w-4 h-4" />
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Chọn ngày"}
                </button>
                {selectedDate && (
                  <button
                    className="absolute -right-8 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600"
                    onClick={() => setSelectedDate(null)}
                    title="Xóa lọc ngày"
                    type="button"
                  >
                    ✕
                  </button>
                )}
                {showCalendar && (
                  <div className="absolute z-20 mt-2 bg-white rounded-xl shadow-lg p-2">
                    <Calendar
                      mode="single"
                      selected={selectedDate ?? undefined}
                      onSelect={date => { setSelectedDate(date); setShowCalendar(false); }}
                      initialFocus
                    />
                  </div>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm kiếm mã, khách, bàn..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-200 outline-none bg-white text-orange-700"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
              </div>
            </div>
          </div>
          {/* Invoice Table */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-semibold text-orange-700">Danh sách hóa đơn</h3>
            </div>
            {loading && <p>Đang tải...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && filteredInvoices.length === 0 && <p>Không có hóa đơn</p>}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-orange-100 text-orange-700">
                    <th className="px-4 py-2 text-left">Mã hóa đơn</th>
                    <th className="px-4 py-2 text-left">Bàn</th>
                    <th className="px-4 py-2 text-left">Ngày tạo</th>
                    <th className="px-4 py-2 text-left">Trạng thái</th>
                    <th className="px-4 py-2 text-left">Xem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv: Invoice, idx: number) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-orange-50 transition">
                      <td className="px-4 py-2 font-semibold">{inv.invoiceId}</td>
                      <td className="px-4 py-2">{inv.tableName}</td>
                      <td className="px-4 py-2">{inv.createdAt ? format(new Date(inv.createdAt), "dd/MM/yyyy") : "N/A"}</td>
                      <td className="px-4 py-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${inv.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{inv.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}</span>
                      </td>
                      <td className="px-4 py-2">
                        <button onClick={() => { setSelectedInvoice(inv); setShowDetail(true); }} className="p-2 bg-orange-100 rounded-full hover:bg-orange-200 transition"><Eye className="w-4 h-4 text-orange-600" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Modal chi tiết hóa đơn */}
          {showDetail && selectedInvoice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
                <button onClick={() => setShowDetail(false)} className="absolute top-2 right-2 p-2 bg-gray-200 rounded-full hover:bg-gray-300">✕</button>
                <h2 className="text-2xl font-bold text-orange-700 mb-4 flex items-center gap-2"><Receipt className="w-6 h-6 text-blue-500" />Chi tiết hóa đơn</h2>
                <div className="mb-2 text-gray-700">Mã hóa đơn: <span className="font-bold">{selectedInvoice.invoiceId}</span></div>
                <div className="mb-2 text-gray-700">Bàn: <span className="font-bold">{selectedInvoice.tableName}</span></div>
                <div className="mb-2 text-gray-700">Người tạo: <span className="font-bold">{selectedInvoice.userAccountName || "N/A"}</span></div>
                <div className="mb-2 text-gray-700">Trạng thái: <span className={`font-bold px-2 py-1 rounded ${selectedInvoice.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{selectedInvoice.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}</span></div>
                <div className="mt-4 mb-2 font-semibold text-orange-700">Danh sách món ăn</div>
                {selectedInvoice.invoiceDishResponses?.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto mt-2">
                    <table className="min-w-full text-sm mb-4">
                      <thead>
                        <tr className="bg-orange-100 text-orange-700">
                          <th className="px-2 py-1 text-left">Tên món</th>
                          <th className="px-2 py-1 text-left">SL</th>
                          <th className="px-2 py-1 text-left">Đơn giá</th>
                          <th className="px-2 py-1 text-left">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.invoiceDishResponses.map((item: InvoiceDish, idx: number) => (
                          <tr key={idx}>
                            <td className="px-2 py-1">{item.dishName || "N/A"}</td>
                            <td className="px-2 py-1">{item.quantity || 0}</td>
                            <td className="px-2 py-1">{(item.price || 0).toLocaleString()} VND</td>
                            <td className="px-2 py-1">{((item.price || 0) * (item.quantity || 0)).toLocaleString()} VND</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-700">Không có món ăn</p>
                )}
                <div className="flex justify-end gap-8 text-base font-semibold">
                  <div>Tổng cộng: <span className="text-green-600">{selectedInvoice.invoiceDishResponses?.reduce((sum: number, item: InvoiceDish) => sum + (item.price || 0) * (item.quantity || 0), 0).toLocaleString()} VND</span></div>
                </div>
                <div className="flex justify-end mt-4">
                  <button className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition">In hóa đơn</button>
                  <button
                    onClick={() => exportToPDF(selectedInvoice)}
                    className="ml-2 px-4 py-2 rounded-lg bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition"
                  >
                    Xuất PDF
                  </button>              </div>
              </div>
            </div>

          )}
        </div>
      </div>
    </div>
  );
};

export default HoaDon;
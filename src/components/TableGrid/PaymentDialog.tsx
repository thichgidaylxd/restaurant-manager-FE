import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RestaurantTable } from "@/types/table";
import VietQR from "./VietQR";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  table: RestaurantTable | null;
  payMethod: "cash" | "transfer" | null;
  showPayOpt: boolean;
  qrUrl: string;
  onConfirmPay: () => void;
  onSelectPayMethod: (method: "cash" | "transfer") => void;
  total: number;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  table,
  payMethod,
  showPayOpt,
  qrUrl,
  onConfirmPay,
  onSelectPayMethod,
  total,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-orange-50 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-orange-600 text-center">
            Hóa đơn - {table?.name || "N/A"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Sử dụng flex để chia hóa đơn và QR */}
          <div className="flex gap-8 items-start">
            {/* Hóa đơn bên trái */}
            <div className="w-full flex-1 border-b border-orange-200 pb-2">
              <h3 className="text-lg font-semibold text-gray-800">Chi tiết hóa đơn</h3>
              <div className="max-h-96 overflow-y-auto mt-2">
                <table className="w-full text-sm text-gray-700">
                  <thead>
                    <tr className="border-b border-orange-200 bg-orange-50">
                      <th className="text-left py-2 text-base sticky top-0 z-10 bg-orange-50">Tên món</th>
                      <th className="text-center py-2 text-base sticky top-0 z-10 bg-orange-50">Số lượng</th>
                      <th className="text-center py-2 text-base sticky top-0 z-10 bg-orange-50">Đơn giá (VND)</th>
                      <th className="text-center py-2 text-base sticky top-0 z-10 bg-orange-50">Thành tiền (VND)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(table?.dishes || []).map((item, index) => (
                      <tr key={index} className="border-b border-orange-100">
                        <td className="py-2 text-base">{item.dishName}</td>
                        <td className="text-center py-2 text-base">{item.quantity}</td>
                        <td className="text-center py-2 text-base">{item.price.toLocaleString()}</td>
                        <td className="text-center py-2 text-base">{(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="w-full py-2 font-semibold text-right pr-10 text-base">Tổng cộng:   {total.toLocaleString()} VND </div>

              {/* Nút chọn phương thức thanh toán */}
              {!payMethod && (
                <div className="w-full flex flex-row space-x-2 mt-4">
                  <Button
                    onClick={() => onSelectPayMethod("cash")}
                    className="flex-1 bg-orange-500 text-white hover:bg-orange-600 text-lg size-12"
                  >
                    Tiền mặt
                  </Button>
                  <Button
                    onClick={() => onSelectPayMethod("transfer")}
                    className="flex-1 bg-orange-500 text-white hover:bg-orange-600 text-lg size-12"
                  >
                    Chuyển khoản
                  </Button>
                </div>
              )}
              {/* Nếu là tiền mặt thì nút xác nhận nằm dưới */}
              {payMethod === "cash" && showPayOpt && (
                <div className="text-center mt-4">
                  <p className="text-gray-700 mb-4">
                    Vui lòng thanh toán bằng tiền mặt: <strong>{total.toLocaleString()} VND</strong>
                  </p>
                  <Button
                    onClick={onConfirmPay}
                    className="w-full bg-green-500 text-white hover:bg-green-600 text-base"
                  >
                    Xác nhận thanh toán
                  </Button>
                </div>
              )}
              {!showPayOpt && payMethod && (
                <p className="text-gray-700 mt-4">Đang xử lý thanh toán...</p>
              )}
            </div>
            {/* QR bên phải, chỉ hiện khi chuyển khoản */}
            {payMethod === "transfer" && showPayOpt && (
              <div className="flex flex-col items-center justify-center min-w-[320px]">
                <p className="text-gray-700 mb-4 mt-4 text-center font-bold ">Quét mã QR để thanh toán:</p>
                <VietQR amount={total} />
                <Button
                  onClick={onConfirmPay}
                  className="w-full mt-4 bg-green-500 text-white hover:bg-green-600"
                >
                  Xác nhận thanh toán
                </Button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
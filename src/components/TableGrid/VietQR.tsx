import React from "react";

interface VietQRProps {
  amount: number;
}

const VietQR: React.FC<VietQRProps> = ({ amount }) => {
  const accountNumber = "02012345678909";
  const bankCode = "MB";
  const accountName = "LE XUAN DUNG";
  const addInfo = "Thanh toan";

  const generateQRUrl = () => {
    const baseURL = "https://img.vietqr.io/image";
    const url = `${baseURL}/${bankCode}-${accountNumber}-compact2.png?addInfo=${encodeURIComponent(
      addInfo
    )}&accountName=${encodeURIComponent(accountName)}`;
    return amount ? `${url}&amount=${amount}` : url;
  };

  return (
    <div style={{ textAlign: "center", fontFamily: "sans-serif" }}>
      <img src={generateQRUrl()} alt="Mã QR VietQR" width="300"
        style={{
          border: "4px solid #fdba74", // cam-300
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          borderRadius: "8px"
        }} />
    </div>
  );
};

export default VietQR;
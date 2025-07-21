import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

// Ảnh background nhà hàng đẹp, sang trọng
const restaurantBg = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1500&q=80";

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(255, 247, 237, 0.92) 0%, rgba(255, 236, 200, 0.85) 100%), url('${restaurantBg}') center center/cover no-repeat fixed`,
        backgroundBlendMode: 'overlay',
      }}
    >
      {/* Overlay gradient nhẹ */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,237,213,0.7) 0%, rgba(253,186,116,0.10) 100%)' }} />
      <main className="flex-1 relative z-10">{children}</main>
    </div>
  );
};

export default MainLayout;

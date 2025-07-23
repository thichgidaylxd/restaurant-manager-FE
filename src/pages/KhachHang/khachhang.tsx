// src/components/CustomerPage.tsx
import React from 'react';

const CustomerPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Trang Khách Hàng</h1>
                <p className="text-lg text-gray-600">
                    Trang này đang được phát triển. Vui lòng quay lại sau!
                </p>
            </div>
        </div>
    );
};

export default CustomerPage;
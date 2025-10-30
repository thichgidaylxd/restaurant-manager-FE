import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Phone, User, Calendar, Users, RefreshCw, Filter } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';

const OrderedTableList = () => {
    const [orderedTables, setOrderedTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchOrderedTables();
    }, []);

    const fetchOrderedTables = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://restaurant-manager-be-f7mh.onrender.com/restaurant/api/ordered-table');
            const result = await response.json();
            console.log('Ordered Tables:', result);

            if (result.data && Array.isArray(result.data)) {
                setOrderedTables(result.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách đặt bàn:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu này?')) {
            return;
        }

        setActionLoading(id);
        try {
            const response = await fetch(`https://restaurant-manager-be-f7mh.onrender.com/restaurant/api/ordered-table/${id}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || 'Duyệt yêu cầu thành công!');
                fetchOrderedTables(); // Reload list
            } else {
                alert('Có lỗi xảy ra: ' + (result.message || 'Vui lòng thử lại'));
            }
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Không thể kết nối đến server');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
            return;
        }

        setActionLoading(id);
        try {
            const response = await fetch(`https://restaurant-manager-be-f7mh.onrender.com/restaurant/api/ordered-table/${id}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message || 'Từ chối yêu cầu thành công!');
                fetchOrderedTables(); // Reload list
            } else {
                alert('Có lỗi xảy ra: ' + (result.message || 'Vui lòng thử lại'));
            }
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Không thể kết nối đến server');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': {
                color: '#ff8c00',
                bg: '#fff5e6',
                text: 'Chờ duyệt',
                icon: <Clock size={16} />
            },
            'APPROVED': {
                color: '#10b981',
                bg: '#d1fae5',
                text: 'Đã duyệt',
                icon: <CheckCircle size={16} />
            },
            'REJECTED': {
                color: '#ef4444',
                bg: '#fee2e2',
                text: 'Đã từ chối',
                icon: <XCircle size={16} />
            },
        };

        const statusInfo = statusMap[status] || statusMap['PENDING'];

        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                color: statusInfo.color,
                backgroundColor: statusInfo.bg,
            }}>
                {statusInfo.icon}
                {statusInfo.text}
            </span>
        );
    };

    const filteredTables = orderedTables.filter(table => {
        if (filterStatus === 'ALL') return true;
        return table.status === filterStatus;
    });

    const getStatusCount = (status) => {
        if (status === 'ALL') return orderedTables.length;
        return orderedTables.filter(t => t.status === status).length;
    };

    return (
        <div className="table-grid-container flex w-full h-screen bg-orange-50 text-foreground">
            <Sidebar />

            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #fff5e6 0%, #ffe0b3 100%)',
                padding: '40px 20px',
                width: '100%',
            }}>

                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '30px',
                        flexWrap: 'wrap',
                        gap: '20px'
                    }}>
                        <div>
                            <h1 style={{
                                fontSize: '36px',
                                fontWeight: 'bold',
                                color: '#ff6b00',
                                marginBottom: '8px'
                            }}>
                                Quản Lý Đặt Bàn
                            </h1>
                            <p style={{ color: '#ff8c00', fontSize: '16px' }}>
                                Tổng số yêu cầu: <strong>{orderedTables.length}</strong>
                            </p>
                        </div>

                        <button
                            onClick={fetchOrderedTables}
                            disabled={loading}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px',
                                backgroundColor: '#ff6b00',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 4px 6px rgba(255, 107, 0, 0.3)'
                            }}
                            onMouseOver={(e) => {
                                if (!loading) e.target.style.backgroundColor = '#ff8c00';
                            }}
                            onMouseOut={(e) => {
                                if (!loading) e.target.style.backgroundColor = '#ff6b00';
                            }}
                        >
                            <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                            {loading ? 'Đang tải...' : 'Làm mới'}
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '30px',
                        flexWrap: 'wrap',
                        background: '#fff',
                        padding: '16px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(255, 107, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b00', fontWeight: '600' }}>
                            <Filter size={20} />
                            Lọc:
                        </div>
                        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '2px solid',
                                    borderColor: filterStatus === status ? '#ff6b00' : '#ffb366',
                                    backgroundColor: filterStatus === status ? '#ff6b00' : '#fff',
                                    color: filterStatus === status ? '#fff' : '#ff6b00',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                }}
                            >
                                {status === 'ALL' ? 'Tất cả' : status === 'PENDING' ? 'Chờ duyệt' : status === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối'}
                                ({getStatusCount(status)})
                            </button>
                        ))}
                    </div>

                    {/* Loading State */}
                    {loading && orderedTables.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: '#fff',
                            borderRadius: '12px'
                        }}>
                            <RefreshCw size={48} style={{ color: '#ff6b00', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                            <p style={{ color: '#ff8c00', fontSize: '18px', fontWeight: '600' }}>Đang tải dữ liệu...</p>
                        </div>
                    ) : filteredTables.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: '#fff',
                            borderRadius: '12px'
                        }}>
                            <p style={{ color: '#ff8c00', fontSize: '18px', fontWeight: '600' }}>
                                Không có yêu cầu đặt bàn nào
                            </p>
                        </div>
                    ) : (
                        /* Table List */
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {filteredTables.map((order) => (
                                <div
                                    key={order.id}
                                    style={{
                                        background: '#fff',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        boxShadow: '0 4px 12px rgba(255, 107, 0, 0.15)',
                                        transition: 'all 0.3s',
                                        border: '2px solid transparent'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = '#ffb366';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = 'transparent';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '20px',
                                        flexWrap: 'wrap',
                                        gap: '16px'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                                                    {order.name || 'Không có tên'}
                                                </h3>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                                                Mã đơn: <span style={{ fontFamily: 'monospace', color: '#ff8c00' }}>{order.id}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                        gap: '16px',
                                        marginBottom: '20px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                backgroundColor: '#fff5e6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <User size={20} style={{ color: '#ff6b00' }} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Tên khách hàng</p>
                                                <p style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: 0 }}>
                                                    {order.name || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                backgroundColor: '#fff5e6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Phone size={20} style={{ color: '#ff6b00' }} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Số điện thoại</p>
                                                <p style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: 0 }}>
                                                    {order.phone || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                backgroundColor: '#fff5e6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Calendar size={20} style={{ color: '#ff6b00' }} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Thời gian đặt</p>
                                                <p style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: 0 }}>
                                                    {formatDateTime(order.orderedTime)}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                backgroundColor: '#fff5e6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Users size={20} style={{ color: '#ff6b00' }} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>Số người</p>
                                                <p style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: 0 }}>
                                                    {order.personNumber || 0} người
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {order.table && (
                                        <div style={{
                                            backgroundColor: '#fff5e6',
                                            padding: '12px 16px',
                                            borderRadius: '10px',
                                            marginBottom: '16px'
                                        }}>
                                            <p style={{ fontSize: '14px', color: '#ff8c00', fontWeight: '600', margin: 0 }}>
                                                Bàn: {order.table.name || 'N/A'} - {order.table.tableType?.name || 'Bàn thường'} (Tối đa {order.table.maxPerson} người)
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {order.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => handleApprove(order.id)}
                                                disabled={actionLoading === order.id}
                                                style={{
                                                    flex: 1,
                                                    minWidth: '150px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    padding: '12px 20px',
                                                    backgroundColor: actionLoading === order.id ? '#86efac' : '#10b981',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    cursor: actionLoading === order.id ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.3s',
                                                }}
                                                onMouseOver={(e) => {
                                                    if (actionLoading !== order.id) e.target.style.backgroundColor = '#059669';
                                                }}
                                                onMouseOut={(e) => {
                                                    if (actionLoading !== order.id) e.target.style.backgroundColor = '#10b981';
                                                }}
                                            >
                                                <CheckCircle size={18} />
                                                {actionLoading === order.id ? 'Đang xử lý...' : 'Duyệt'}
                                            </button>

                                            <button
                                                onClick={() => handleReject(order.id)}
                                                disabled={actionLoading === order.id}
                                                style={{
                                                    flex: 1,
                                                    minWidth: '150px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    padding: '12px 20px',
                                                    backgroundColor: actionLoading === order.id ? '#fca5a5' : '#ef4444',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '10px',
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    cursor: actionLoading === order.id ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.3s',
                                                }}
                                                onMouseOver={(e) => {
                                                    if (actionLoading !== order.id) e.target.style.backgroundColor = '#dc2626';
                                                }}
                                                onMouseOut={(e) => {
                                                    if (actionLoading !== order.id) e.target.style.backgroundColor = '#ef4444';
                                                }}
                                            >
                                                <XCircle size={18} />
                                                {actionLoading === order.id ? 'Đang xử lý...' : 'Từ chối'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <style>
                    {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
                </style>
            </div>
        </div>
    );
};

export default OrderedTableList;
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Phone, User, Clock, AlertCircle } from 'lucide-react';

interface Table {
  id: string;
  name: string;
  tableType: {
    id: string;
    name: string;
  };
  maxPerson: number;
  status: string;
}

interface FormData {
  phone: string;
  name: string;
  orderedTime: string;
  personNumber: string;
  tableId: string;
}

interface FormErrors {
  [key: string]: string;
}

const TableBooking: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [formData, setFormData] = useState<FormData>({
    phone: '',
    name: '',
    orderedTime: '',
    personNumber: '',
    tableId: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Fetch danh sách bàn khi component mount
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch('https://restaurant-manager-be-f7mh.onrender.com/restaurant/api/tables');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (result.data && Array.isArray(result.data)) {
        // Lọc chỉ lấy bàn còn trống và đảm bảo dữ liệu hợp lệ
        const availableTables = result.data
          .filter(table => table && table.status === 'Trống')
          .map(table => ({
            id: table.id,
            name: table.name || 'Bàn không tên',
            tableType: {
              id: table.tableType?.id || '',
              name: table.tableType?.name || 'Bàn thường'
            },
            maxPerson: table.maxPerson || 0,
            status: table.status || ''
          }));
        setTables(availableTables);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách bàn:', error);
      setTables([]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập Họ và tên';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập Số điện thoại';
    } else if (!/^(0[0-9]{9})$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 số)';
    }

    if (!formData.orderedTime) {
      newErrors.orderedTime = 'Vui lòng chọn Thời gian đặt bàn';
    } else {
      const selectedTime = new Date(formData.orderedTime);
      const now = new Date();
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 1);

      if (selectedTime < now) {
        newErrors.orderedTime = 'Thời gian đặt bàn phải sau thời điểm hiện tại';
      } else if (selectedTime > maxDate) {
        newErrors.orderedTime = 'Chỉ được đặt bàn trước tối đa 1 tháng';
      }
    }

    const personNumber = parseInt(formData.personNumber);
    if (!formData.personNumber) {
      newErrors.personNumber = 'Vui lòng nhập Số người';
    } else if (isNaN(personNumber) || personNumber < 1) {
      newErrors.personNumber = 'Số người phải lớn hơn 0';
    } else if (personNumber > 20) {
      newErrors.personNumber = 'Số người không được vượt quá 20';
    }

    if (!formData.tableId) {
      newErrors.tableId = 'Vui lòng chọn Bàn';
    } else {
      const selectedTable = tables.find(table => table.id === formData.tableId);
      if (selectedTable && parseInt(formData.personNumber) > selectedTable.maxPerson) {
        newErrors.tableId = `Bàn này chỉ phục vụ tối đa ${selectedTable.maxPerson} người`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://restaurant-manager-be-f7mh.onrender.com/restaurant/api/ordered-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          personNumber: parseInt(formData.personNumber),
          orderedTime: new Date(formData.orderedTime).toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setSubmitSuccess(true);
      // Reset form
      setFormData({
        phone: '',
        name: '',
        orderedTime: '',
        personNumber: '',
        tableId: ''
      });
      // Tải lại danh sách bàn
      await fetchTables();

      // Ẩn thông báo thành công sau 3 giây
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff5e6 0%, #ffe0b3 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff6b00', marginBottom: '10px' }}>
            Đặt Bàn Nhà Hàng
          </h1>
          <p style={{ color: '#ff8c00', fontSize: '16px' }}>
            Vui lòng điền đầy đủ thông tin để đặt bàn
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div style={{
            background: '#fff',
            border: '2px solid #4ade80',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ color: '#4ade80', fontSize: '24px' }}>✓</div>
            <div style={{ color: '#16a34a', fontWeight: '600' }}>
              Đặt bàn thành công! Chúng tôi sẽ liên hệ với bạn sớm.
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(255, 107, 0, 0.2)'
        }}>
          {/* Họ và tên */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ff6b00' }}>
              <User size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Họ và tên
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập họ và tên của bạn"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.name ? '2px solid #ef4444' : '2px solid #ffb366',
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff6b00'}
              onBlur={(e) => e.target.style.borderColor = errors.name ? '#ef4444' : '#ffb366'}
            />
            {errors.name && (
              <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={16} />
                {errors.name}
              </div>
            )}
          </div>

          {/* Số điện thoại */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ff6b00' }}>
              <Phone size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.phone ? '2px solid #ef4444' : '2px solid #ffb366',
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff6b00'}
              onBlur={(e) => e.target.style.borderColor = errors.phone ? '#ef4444' : '#ffb366'}
            />
            {errors.phone && (
              <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={16} />
                {errors.phone}
              </div>
            )}
          </div>

          {/* Thời gian đặt bàn */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ff6b00' }}>
              <Clock size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Thời gian đặt bàn
            </label>
            <input
              type="datetime-local"
              name="orderedTime"
              value={formData.orderedTime}
              onChange={handleChange}
              min={getMinDateTime()}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.orderedTime ? '2px solid #ef4444' : '2px solid #ffb366',
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff6b00'}
              onBlur={(e) => e.target.style.borderColor = errors.orderedTime ? '#ef4444' : '#ffb366'}
            />
            {errors.orderedTime && (
              <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={16} />
                {errors.orderedTime}
              </div>
            )}
          </div>

          {/* Số người */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ff6b00' }}>
              <Users size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Số người
            </label>
            <input
              type="number"
              name="personNumber"
              value={formData.personNumber}
              onChange={handleChange}
              placeholder="Nhập số người"
              min="1"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.personNumber ? '2px solid #ef4444' : '2px solid #ffb366',
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff6b00'}
              onBlur={(e) => e.target.style.borderColor = errors.personNumber ? '#ef4444' : '#ffb366'}
            />
            {errors.personNumber && (
              <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={16} />
                {errors.personNumber}
              </div>
            )}
          </div>

          {/* Chọn bàn */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#ff6b00' }}>
              <Calendar size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Chọn bàn
            </label>
            <select
              name="tableId"
              value={formData.tableId}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.tableId ? '2px solid #ef4444' : '2px solid #ffb366',
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s',
                boxSizing: 'border-box',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff6b00'}
              onBlur={(e) => e.target.style.borderColor = errors.tableId ? '#ef4444' : '#ffb366'}
            >
              <option value="">-- Chọn bàn --</option>
              {tables.length > 0 ? (
                tables.map(table => (
                  <option key={table.id} value={table.id}>
                    {table.name} - {table.tableType.name} (Tối đa {table.maxPerson} người)
                  </option>
                ))
              ) : (
                <option disabled>Không có bàn trống</option>
              )}
            </select>
            {errors.tableId && (
              <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={16} />
                {errors.tableId}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: loading ? '#ffb366' : '#ff6b00',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 6px rgba(255, 107, 0, 0.3)'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              const button = e.currentTarget;
              if (!loading) {
                button.style.backgroundColor = '#ff8c00';
              }
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              const button = e.currentTarget;
              if (!loading) {
                button.style.backgroundColor = '#ff6b00';
              }
            }}
          >
            {loading ? 'Đang xử lý...' : 'Đặt Bàn Ngay'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', color: '#ff8c00' }}>
          <p style={{ fontSize: '14px' }}>
            Cần hỗ trợ? Liên hệ: <strong>0123 456 789</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TableBooking;
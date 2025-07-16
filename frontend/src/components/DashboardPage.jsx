import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Dashboard</h1>
      <p>Chào mừng, {user?.full_name || user?.name}!</p>
      <p>Đây là trang dành cho người dùng đã đăng nhập.</p>
      
      <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Các Club đã tham gia</h3>
          <p>Bạn chưa tham gia club nào.</p>
        </div>
        
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Sự kiện sắp tới</h3>
          <p>Không có sự kiện nào.</p>
        </div>
        
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Thông báo</h3>
          <p>Bạn không có thông báo mới.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

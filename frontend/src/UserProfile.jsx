import React from 'react';
import UserLayout from './layouts/UserLayout';
import avatar from './Picture/Logo.png'; // Thay bằng avatar thật nếu có

export default function UserProfile() {
  // Dữ liệu mẫu, sau này lấy từ context hoặc API
  const user = {
    name: 'Nguyen Van A',
    email: 'nguyenvana@example.com',
    avatar: avatar,
    role: 'Member',
    joined: '2024-01-01',
  };

  return (
    <UserLayout user={user}>
      <div style={{ maxWidth: 500, margin: '40px auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 32, textAlign: 'center' }}>
        <img src={user.avatar} alt="avatar" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #3C3A6B', marginBottom: 16 }} />
        <h2 style={{ margin: '12px 0 4px', color: '#3C3A6B', fontWeight: 900 }}>{user.name}</h2>
        <div style={{ color: '#555', marginBottom: 12 }}>{user.email}</div>
        <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>Role: <b>{user.role}</b></div>
        <div style={{ color: '#888', fontSize: 15 }}>Thành viên từ: <b>{user.joined}</b></div>
      </div>
    </UserLayout>
  );
} 
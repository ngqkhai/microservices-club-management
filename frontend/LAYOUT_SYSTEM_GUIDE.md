# Layout System Usage Guide

## Tổng quan
Hệ thống layout của ứng dụng Club Management tự động chuyển đổi giữa Guest Layout và User Layout dựa trên trạng thái đăng nhập của người dùng.

## Cấu trúc Layout

### 1. GuestLayout
- **Khi nào sử dụng**: Khi người dùng chưa đăng nhập
- **Tính năng**: 
  - Header với logo và menu cơ bản (HOME, CLUBS, EVENTS)
  - Nút Login và Sign up
  - Footer với thông tin liên hệ

### 2. UserLayout  
- **Khi nào sử dụng**: Khi người dùng đã đăng nhập
- **Tính năng**:
  - Header với logo và menu mở rộng (DASHBOARD, CLUBS, EVENTS)
  - Icon thông báo và tin nhắn
  - Avatar và tên người dùng
  - Nút Logout
  - Footer tương tự GuestLayout

## Cách sử dụng

### 1. LayoutWrapper Component
```jsx
import LayoutWrapper from '../layouts/LayoutWrapper';

// Tự động chọn layout phù hợp
<LayoutWrapper>
  <YourPageContent />
</LayoutWrapper>
```

### 2. AuthContext
```jsx
import { useAuth } from '../contexts/AuthContext';

const { isAuthenticated, user, login, logout } = useAuth();
```

### 3. ProtectedRoute Component
```jsx
import ProtectedRoute from '../components/ProtectedRoute';

// Bảo vệ route cần đăng nhập
<Route path="/dashboard" element={
  <ProtectedRoute>
    <LayoutWrapper>
      <DashboardPage />
    </LayoutWrapper>
  </ProtectedRoute>
} />
```

## Quy tắc Route

### Public Routes (Không cần layout wrapper)
- `/login` - Trang đăng nhập
- `/signup` - Trang đăng ký  
- `/verifySignUp` - Xác thực đăng ký
- `/verify-email` - Xác thực email
- `/forgotpassword_1` - Quên mật khẩu bước 1
- `/forgot-password-verify` - Xác thực reset mật khẩu

### Flexible Routes (Dùng cho cả guest và user)
- `/` - Trang chủ
- `/clubs` - Danh sách câu lạc bộ
- `/clubs/:clubId` - Chi tiết câu lạc bộ

### Protected Routes (Cần đăng nhập)
- `/dashboard` - Trang chính sau đăng nhập
- `/profile` - Hồ sơ cá nhân
- `/clubspace/:clubId` - Không gian câu lạc bộ

## Authentication Flow

### 1. Đăng nhập thành công
```jsx
// Trong LoginPage
const result = await loginUser({ email, password });
if (result.success) {
  login(result.data); // Cập nhật AuthContext
  navigate(from, { replace: true }); // Redirect về trang trước đó hoặc home
}
```

### 2. Đăng xuất
```jsx
// UserLayout có sẵn nút logout
const { logout } = useAuth();
await logout(); // Tự động clear storage và chuyển về GuestLayout
```

### 3. Kiểm tra trạng thái đăng nhập
```jsx
// AuthContext tự động kiểm tra localStorage khi app khởi động
const { isAuthenticated, user, loading } = useAuth();

if (loading) return <div>Loading...</div>;
if (isAuthenticated) {
  // User đã đăng nhập - sử dụng UserLayout
} else {
  // User chưa đăng nhập - sử dụng GuestLayout  
}
```

## Lưu ý kỹ thuật

### 1. Token Management
- Access token và refresh token được lưu trong localStorage
- Axios interceptor tự động thêm Bearer token vào header
- Tự động redirect về login khi token expire (401)

### 2. Component Structure
```
App.js
├── AuthProvider (Context)
├── Router
    ├── Public Routes (không layout)
    ├── Flexible Routes (LayoutWrapper)
    └── Protected Routes (ProtectedRoute + LayoutWrapper)
```

### 3. Layout Selection Logic
```jsx
// LayoutWrapper.jsx
const { isAuthenticated, user, logout } = useAuth();

if (isAuthenticated) {
  return <UserLayout user={user} onLogout={logout}>{children}</UserLayout>;
} else {
  return <GuestLayout>{children}</GuestLayout>;
}
```

## Ví dụ sử dụng

### Tạo page mới cho authenticated user
```jsx
// components/MyNewPage.jsx
import React from 'react';

const MyNewPage = () => {
  return (
    <div>
      <h1>My New Page</h1>
      {/* Page content */}
    </div>
  );
};

export default MyNewPage;

// Thêm vào App.js
<Route path="/my-new-page" element={
  <ProtectedRoute>
    <LayoutWrapper>
      <MyNewPage />
    </LayoutWrapper>
  </ProtectedRoute>
} />
```

### Tạo page dùng chung cho guest và user
```jsx
// App.js
<Route path="/events" element={
  <LayoutWrapper>
    <EventsPage />
  </LayoutWrapper>
} />
```

## Troubleshooting

### 1. Layout không thay đổi sau đăng nhập
- Kiểm tra AuthContext có được cập nhật đúng không
- Kiểm tra localStorage có chứa token và user data không

### 2. Redirect loop
- Kiểm tra ProtectedRoute logic
- Kiểm tra navigation state trong login function

### 3. Token không được gửi trong API calls
- Kiểm tra axios interceptor setup
- Kiểm tra token format trong localStorage

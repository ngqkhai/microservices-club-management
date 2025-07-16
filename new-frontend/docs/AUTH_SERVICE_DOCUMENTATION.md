# Auth Service - API Documentation & Implementation Guide

## Tổng quan

Auth Service là microservice xử lý xác thực và quản lý người dùng trong hệ thống Club Management. Service này cung cấp các tính năng đăng ký, đăng nhập, xác thực email, quản lý mật khẩu và phân quyền.

### Thông tin kỹ thuật
- **Port**: 3001
- **Base URL**: `http://localhost:3001/api/auth`
- **Database**: PostgreSQL với Sequelize ORM
- **Authentication**: JWT tokens (Access + Refresh)
- **Email Service**: RabbitMQ events để gửi email
- **Documentation**: Swagger UI tại `/api/auth/docs`

---

## API Specifications

### Base Headers
Tất cả requests cần header từ API Gateway:
```http
x-gateway-secret: [SECRET_KEY]
```

Các endpoints cần authentication cần thêm:
```http
x-user-id: [USER_UUID]
x-user-role: [USER|ADMIN]
```

---

## 1. Tính năng Đăng ký (Registration)

### API Endpoint
```http
POST /api/auth/register
```

### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "Nguyễn Văn A"
}
```

### Response
```json
{
  "success": true,
  "message": "Registration successful. Please check your email and click the verification link to activate your account.",
  "data": {
    "email": "user@example.com",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "Nguyễn Văn A",
      "role": "user",
      "email_verified": false,
      "created_at": "2025-01-16T00:00:00.000Z"
    }
  }
}
```

### Flow Implementation cho Frontend

```mermaid
sequenceDiagram
    participant F as Frontend
    participant G as API Gateway
    participant A as Auth Service
    participant R as RabbitMQ
    participant N as Notification Service
    participant E as Email Service

    F->>G: POST /register với form data
    G->>A: Forward request + gateway headers
    A->>A: Validate email không trùng
    A->>A: Tạo user với email_verified=false
    A->>A: Generate email verification token
    A->>R: Publish email verification event
    R->>N: Forward event
    N->>E: Send verification email
    A->>G: Return success response
    G->>F: Return response
    F->>F: Hiển thị thông báo "Check email"
```

### Frontend Implementation Steps

1. **User điền form đăng ký**
   ```javascript
   const registerData = {
     email: formData.email,
     password: formData.password,
     full_name: formData.fullName
   };
   ```

2. **Gửi request đăng ký**
   ```javascript
   try {
     const response = await fetch('/api/auth/register', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify(registerData)
     });
     
     const result = await response.json();
     
     if (result.success) {
       // Hiển thị thông báo thành công
       showMessage(result.message);
       // Redirect đến trang login hoặc email verification
       router.push('/check-email');
     }
   } catch (error) {
     showError('Registration failed');
   }
   ```

3. **Hiển thị trang check email**
   - Thông báo người dùng check email
   - Có thể có button "Resend email" (cần implement API riêng)

---

## 2. Tính năng Xác thực Email (Email Verification)

### API Endpoint
```http
POST /api/auth/verify-email
```

### Request Body
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login to your account.",
  "data": {
    "verified": true,
    "alreadyVerified": false
  }
}
```

### Flow Implementation cho Frontend

```mermaid
sequenceDiagram
    participant U as User
    participant E as Email
    participant F as Frontend
    participant G as API Gateway
    participant A as Auth Service

    U->>E: Click verification link
    E->>F: Redirect to /verify-email?token=xxx
    F->>F: Extract token từ URL
    F->>G: POST /verify-email với token
    G->>A: Forward request
    A->>A: Verify JWT token
    A->>A: Update user.email_verified = true
    A->>G: Return verification result
    G->>F: Return response
    F->>F: Hiển thị kết quả và redirect
```

### Frontend Implementation Steps

1. **Xử lý verification route**
   ```javascript
   // Route: /verify-email?token=xxx
   useEffect(() => {
     const urlParams = new URLSearchParams(window.location.search);
     const token = urlParams.get('token');
     
     if (token) {
       verifyEmail(token);
     }
   }, []);
   ```

2. **Gọi API verify email**
   ```javascript
   const verifyEmail = async (token) => {
     try {
       const response = await fetch('/api/auth/verify-email', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({ token })
       });
       
       const result = await response.json();
       
       if (result.success) {
         if (result.data.alreadyVerified) {
           showMessage('Email đã được xác thực trước đó');
         } else {
           showMessage('Email xác thực thành công!');
         }
         // Redirect đến login page
         setTimeout(() => router.push('/login'), 2000);
       } else {
         showError('Link xác thực không hợp lệ hoặc đã hết hạn');
       }
     } catch (error) {
       showError('Xác thực email thất bại');
     }
   };
   ```

---

## 3. Tính năng Đăng nhập (Login)

### API Endpoint
```http
POST /api/auth/login
```

### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}
```

### Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "Nguyễn Văn A",
      "role": "user",
      "email_verified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note**: Refresh token được set trong HTTP-only cookie

### Flow Implementation cho Frontend

```mermaid
sequenceDiagram
    participant F as Frontend
    participant G as API Gateway
    participant A as Auth Service

    F->>G: POST /login với credentials
    G->>A: Forward request
    A->>A: Validate email + password
    A->>A: Check email_verified = true
    A->>A: Generate access + refresh tokens
    A->>A: Store refresh token in DB
    A->>G: Return tokens + user data
    G->>F: Set refresh token cookie + return response
    F->>F: Store access token + user data
    F->>F: Redirect to dashboard
```

### Frontend Implementation Steps

1. **User điền form login**
   ```javascript
   const loginData = {
     email: formData.email,
     password: formData.password,
     rememberMe: formData.rememberMe
   };
   ```

2. **Gửi request login**
   ```javascript
   const login = async (loginData) => {
     try {
       const response = await fetch('/api/auth/login', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify(loginData),
         credentials: 'include' // Để nhận cookie
       });
       
       const result = await response.json();
       
       if (result.success) {
         // Lưu access token và user data
         localStorage.setItem('accessToken', result.data.accessToken);
         localStorage.setItem('user', JSON.stringify(result.data.user));
         
         // Redirect theo role
         if (result.data.user.role === 'admin') {
           router.push('/admin/dashboard');
         } else {
           router.push('/dashboard');
         }
       } else {
         // Xử lý các lỗi khác nhau
         handleLoginError(response.status, result);
       }
     } catch (error) {
       showError('Login failed');
     }
   };
   ```

3. **Xử lý các trường hợp lỗi**
   ```javascript
   const handleLoginError = (status, result) => {
     switch (status) {
       case 401:
         if (result.message.includes('email')) {
           showError('Email chưa được xác thực. Vui lòng check email.');
           router.push('/check-email');
         } else {
           showError('Email hoặc mật khẩu không đúng');
         }
         break;
       case 423:
         showError('Tài khoản bị khóa do đăng nhập sai quá nhiều lần');
         break;
       case 429:
         showError('Quá nhiều lần thử. Vui lòng thử lại sau');
         break;
       default:
         showError('Đăng nhập thất bại');
     }
   };
   ```

---

## 4. Tính năng Refresh Token

### API Endpoint
```http
POST /api/auth/refresh
```

### Request
Refresh token từ HTTP-only cookie (tự động gửi)

### Response
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "Nguyễn Văn A",
      "role": "user"
    },
    "accessToken": "new_access_token"
  }
}
```

### Frontend Implementation

```javascript
// Axios interceptor để tự động refresh token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (refreshResponse.ok) {
          const result = await refreshResponse.json();
          localStorage.setItem('accessToken', result.data.accessToken);
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${result.data.accessToken}`;
          return axios.request(error.config);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        router.push('/login');
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 5. Tính năng Quên mật khẩu (Forgot Password)

### API Endpoint
```http
POST /api/auth/forgot-password
```

### Request Body
```json
{
  "email": "user@example.com"
}
```

### Response
```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent"
}
```

### Flow Implementation

```mermaid
sequenceDiagram
    participant F as Frontend
    participant G as API Gateway
    participant A as Auth Service
    participant R as RabbitMQ
    participant N as Notification Service

    F->>G: POST /forgot-password với email
    G->>A: Forward request
    A->>A: Find user by email
    A->>A: Generate reset token
    A->>R: Publish password reset event
    R->>N: Send reset email
    A->>G: Return success (same response dù email có tồn tại hay không)
    G->>F: Return response
    F->>F: Hiển thị "Check email for reset link"
```

### Frontend Implementation

```javascript
const forgotPassword = async (email) => {
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showMessage('Nếu email tồn tại, link reset mật khẩu đã được gửi');
      router.push('/check-email');
    }
  } catch (error) {
    showError('Request failed');
  }
};
```

---

## 6. Tính năng Reset mật khẩu (Reset Password)

### API Endpoint
```http
POST /api/auth/reset-password
```

### Request Body
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!"
}
```

### Response
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Frontend Implementation

```javascript
// Route: /reset-password?token=xxx
const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, newPassword })
    });
    
    const result = await response.json();
    
    if (result.success) {
      showMessage('Mật khẩu đã được reset thành công');
      router.push('/login');
    } else {
      showError('Reset token không hợp lệ hoặc đã hết hạn');
    }
  } catch (error) {
    showError('Reset password failed');
  }
};
```

---

## 7. Tính năng Đăng xuất (Logout)

### API Endpoint
```http
POST /api/auth/logout
```

### Headers
```http
x-user-id: [USER_UUID]
x-user-role: [USER_ROLE]
```

### Response
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Frontend Implementation

```javascript
const logout = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // Gửi refresh token cookie
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    
    // Clear local storage dù API có thành công hay không
    localStorage.clear();
    
    // Redirect to login
    router.push('/login');
  } catch (error) {
    // Vẫn clear và redirect kể cả khi có lỗi
    localStorage.clear();
    router.push('/login');
  }
};
```

---

## 8. Quản lý Profile

### Get Current User
```http
GET /api/auth/me
```

### Update Profile
```http
PUT /api/auth/profile
```

### Change Password
```http
POST /api/auth/change-password
```

---

## 9. Error Handling

### Common Error Codes
- `400`: Validation Error
- `401`: Unauthorized / Invalid Credentials
- `403`: Forbidden / Insufficient Permissions
- `404`: User Not Found
- `409`: Email Already Exists
- `423`: Account Locked
- `429`: Rate Limit Exceeded

### Frontend Error Handling Pattern

```javascript
const handleApiError = (response, result) => {
  switch (response.status) {
    case 400:
      if (result.details?.validation) {
        showValidationErrors(result.details.validation);
      } else {
        showError(result.message || 'Dữ liệu không hợp lệ');
      }
      break;
    case 401:
      if (result.code === 'EMAIL_NOT_VERIFIED') {
        showError('Vui lòng xác thực email trước khi đăng nhập');
        router.push('/check-email');
      } else {
        showError('Thông tin đăng nhập không đúng');
      }
      break;
    case 409:
      showError('Email đã tồn tại');
      break;
    case 423:
      showError('Tài khoản bị khóa tạm thời');
      break;
    case 429:
      showError('Quá nhiều yêu cầu. Vui lòng thử lại sau');
      break;
    default:
      showError('Đã có lỗi xảy ra');
  }
};
```

---

## 10. Security Features

### Rate Limiting
- Registration: 5 requests/15 minutes per IP
- Login: 10 requests/15 minutes per IP
- Password Reset: 3 requests/hour per IP
- Refresh Token: 10 requests/minute per IP

### Account Security
- Account lockout sau 5 lần đăng nhập sai
- Password requirements: tối thiểu 8 ký tự
- JWT tokens với expiration
- HTTP-only cookies cho refresh tokens

### Frontend Security Best Practices

```javascript
// 1. Store access token securely
// Sử dụng localStorage (hoặc sessionStorage cho bảo mật cao hơn)
const storeToken = (token) => {
  localStorage.setItem('accessToken', token);
};

// 2. Always include credentials for cookie-based auth
const makeAuthenticatedRequest = (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
};

// 3. Auto-logout on token expiration
const setupAutoLogout = () => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    const now = Date.now();
    
    if (expiry <= now) {
      logout();
    } else {
      setTimeout(logout, expiry - now);
    }
  }
};
```

---

## 11. Testing & Development

### Health Check Endpoints
- `GET /api/auth/health` - Overall service health
- `GET /api/auth/liveness` - Kubernetes liveness probe
- `GET /api/auth/readiness` - Kubernetes readiness probe

### Development URLs
- API Base: `http://localhost:3001/api/auth`
- Swagger Documentation: `http://localhost:3001/api/auth/docs`

---

## 12. Environment Configuration

### Required Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/club_auth

# JWT
JWT_SECRET=your-jwt-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Frontend
FRONTEND_BASE_URL=http://localhost:3000

# API Gateway
API_GATEWAY_SECRET=your-gateway-secret

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
```

---

Tài liệu này cung cấp đầy đủ thông tin để Frontend team implement các tính năng authentication. Mỗi flow đều có sequence diagram và code example cụ thể để dễ dàng triển khai.

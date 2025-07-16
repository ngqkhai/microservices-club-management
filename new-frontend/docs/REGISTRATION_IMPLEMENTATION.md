# Registration Flow Implementation - Testing Guide

## Đã implement thành công

Đã hoàn thành việc implement tính năng Đăng ký (Registration) theo đúng flow trong tài liệu Auth Service Documentation.

## Các thay đổi chính

### 1. **Auth Service Updates**
- ✅ Cập nhật `RegisterRequest` interface để sử dụng `full_name` thay vì `name`
- ✅ Thêm `RegisterResponse` interface 
- ✅ Thêm email verification methods: `verifyEmail()`, `resendVerification()`
- ✅ Thêm forgot/reset password methods

### 2. **API Configuration**
- ✅ Thêm endpoints: `/verify-email`, `/resend-verification`, `/forgot-password`, `/reset-password`

### 3. **Auth Store Updates**
- ✅ Cập nhật `signup()` để không auto-login sau registration
- ✅ User phải verify email trước khi có thể login

### 4. **UI Components**
- ✅ Cập nhật **Signup Page** với password validation mạnh hơn (8 ký tự, uppercase, lowercase, number)
- ✅ Tạo **Check Email Page** với resend functionality
- ✅ Tạo **Email Verification Page** với auto redirect

### 5. **Registration Flow**

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant G as API Gateway  
    participant A as Auth Service
    participant E as Email Service

    U->>F: Điền form registration
    F->>G: POST /api/auth/register
    G->>A: Forward request
    A->>A: Validate + Create user (email_verified=false)
    A->>E: Send verification email
    A->>G: Return success message
    G->>F: Return response
    F->>F: Redirect to /check-email
    
    U->>E: Click verification link in email
    E->>F: Redirect to /verify-email?token=xxx
    F->>G: POST /api/auth/verify-email
    G->>A: Verify token
    A->>A: Set email_verified=true
    A->>G: Return success
    G->>F: Return response
    F->>F: Show success + redirect to /login
```

## Cách test Registration Flow

### 1. **Test Registration**
```bash
# 1. Start frontend
cd new-frontend
npm run dev

# 2. Truy cập http://localhost:3000/signup
# 3. Điền form với:
#    - Full Name: "Nguyen Van A"
#    - Email: "test@example.com" 
#    - Password: "SecurePass123!" (phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số)
#    - Confirm Password: "SecurePass123!"
#    - Check Terms & Conditions
# 4. Click "Create Account"
```

### 2. **Expected Registration Response**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email and click the verification link to activate your account.",
  "data": {
    "email": "test@example.com",
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "full_name": "Nguyen Van A",
      "role": "user",
      "email_verified": false,
      "created_at": "2025-01-16T00:00:00.000Z"
    }
  }
}
```

### 3. **Check Email Page**
- ✅ User được redirect đến `/check-email`
- ✅ Hiển thị message "Check your email"
- ✅ Có button "Resend verification email"
- ✅ Có button "Back to Login"

### 4. **Email Verification**
```bash
# 1. User nhận email với link:
# http://localhost:3000/verify-email?token=JWT_TOKEN

# 2. Click link sẽ:
#    - Truy cập /verify-email?token=xxx
#    - Call API POST /api/auth/verify-email với token
#    - Hiển thị kết quả verification
#    - Auto redirect đến /login sau 3 giây
```

### 5. **Test Resend Email**
```bash
# 1. Từ /check-email page
# 2. Click "Resend verification email"
# 3. Should call POST /api/auth/resend-verification
# 4. Show success toast
```

## API Endpoints được sử dụng

### Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "full_name": "Nguyen Van A"
}
```

### Email Verification  
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Resend Verification
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "test@example.com"
}
```

## Error Handling

### Frontend xử lý các trường hợp:
- ✅ **400**: Validation errors (email format, password strength)
- ✅ **409**: Email already exists
- ✅ **429**: Rate limiting
- ✅ **Network errors**: Timeout, connection issues

### Validation Rules:
- ✅ **Email**: Valid email format
- ✅ **Password**: Minimum 8 characters, uppercase, lowercase, number
- ✅ **Full Name**: At least 2 characters
- ✅ **Terms**: Must accept terms & conditions

## Security Features

### Implemented:
- ✅ **Password strength validation**
- ✅ **Email verification requirement**
- ✅ **Rate limiting support**
- ✅ **JWT token validation**
- ✅ **CSRF protection via API Gateway**

## Next Steps

1. **Test với real backend**:
   - Start Auth Service (port 3001)
   - Start API Gateway (port 8000)
   - Test full flow

2. **Error scenarios to test**:
   - Invalid email format
   - Weak password
   - Email already exists
   - Invalid verification token
   - Expired verification token

3. **Additional features** (nếu cần):
   - Account lockout after failed attempts
   - Password complexity meter
   - Social login integration
   - Phone number verification

## Files Modified/Created

### Modified:
- `services/auth.service.ts` - Added email verification methods
- `config/index.ts` - Added new endpoints
- `stores/auth-store.ts` - Updated signup flow
- `app/signup/page.tsx` - Enhanced validation & flow
- `services/index.ts` - Export new interfaces

### Created:
- `app/check-email/page.tsx` - Check email page
- `app/verify-email/page.tsx` - Email verification page

---

**Registration Flow đã ready để test với backend!** 🚀

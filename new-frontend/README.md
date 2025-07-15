# New Frontend Setup Guide

## Cài đặt & Khởi chạy

### 1. Cài đặt dependencies

```bash
cd new-frontend
npm install
# hoặc
pnpm install
```

### 2. Cấu hình environment

Sao chép file `.env.example` thành `.env.local`:

```bash
cp .env.example .env.local
```

Chỉnh sửa các giá trị trong `.env.local` theo môi trường của bạn:

```env
# API Gateway Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=10000

# Environment (development, staging, production)
NEXT_PUBLIC_ENV=development

# JWT Configuration
NEXT_PUBLIC_JWT_STORAGE_KEY=club_management_token
NEXT_PUBLIC_JWT_REFRESH_STORAGE_KEY=club_management_refresh_token

# Application Configuration
NEXT_PUBLIC_APP_NAME=Club Management System
NEXT_PUBLIC_APP_VERSION=1.0.0

# Debug Mode
NEXT_PUBLIC_DEBUG=true
```

### 3. Khởi chạy development server

```bash
npm run dev
# hoặc
pnpm dev
```

Ứng dụng sẽ chạy trên http://localhost:3000

## Cấu trúc tích hợp

### API Services

Các service API đã được tạo trong thư mục `services/`:

- **auth.service.ts**: Xử lý đăng nhập, đăng ký, profile
- **club.service.ts**: Quản lý câu lạc bộ
- **event.service.ts**: Quản lý sự kiện  
- **notification.service.ts**: Thông báo

### Configuration

- **config/index.ts**: Cấu hình chính của ứng dụng, bao gồm API endpoints
- **lib/api.ts**: Utilities cho HTTP requests, xử lý JWT, error handling

### State Management

- **stores/auth-store.ts**: Zustand store cho authentication state
- **components/providers/auth-provider.tsx**: Provider để load user state

### Environment Variables

Tất cả cấu hình được quản lý thông qua environment variables với prefix `NEXT_PUBLIC_`.

## Tích hợp với Backend

### API Gateway

Frontend giao tiếp với backend thông qua Kong API Gateway tại `http://localhost:8000`.

### Authentication Flow

1. User đăng nhập → Frontend gọi `/api/auth/login`
2. Backend trả về JWT access token
3. Frontend lưu token vào localStorage
4. Các request tiếp theo gửi kèm header `Authorization: Bearer <token>`
5. Kong Gateway xác thực JWT và inject user info vào header cho backend

### API Endpoints

Tất cả endpoints đã được định nghĩa trong `config/index.ts`:

- **Auth**: `/api/auth/*`
- **Clubs**: `/api/clubs/*`
- **Events**: `/api/events/*`
- **Notifications**: `/api/notifications/*`

### Error Handling

- Tất cả API errors được xử lý thống nhất
- JWT timeout tự động được detect và redirect đến login
- Network errors được handle gracefully

## Development Notes

### API Proxy (Optional)

Nếu muốn proxy API calls thông qua Next.js (để tránh CORS issues), set:

```env
USE_API_PROXY=true
```

### Debug Mode

Khi `NEXT_PUBLIC_DEBUG=true`, console logs sẽ hiển thị chi tiết các API calls.

### Token Management

- Access tokens được lưu trong localStorage
- Refresh tokens (nếu có) cũng được lưu riêng
- Auto logout khi token expired

## Production Deployment

### Environment Variables

Đảm bảo set đúng các environment variables cho production:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-gateway-domain.com
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_DEBUG=false
```

### Build & Start

```bash
npm run build
npm run start
```

## Troubleshooting

### CORS Issues

Nếu gặp CORS issues, check:
1. Kong Gateway có enable CORS plugin
2. Frontend domain được whitelist trong Kong config
3. Có thể enable API proxy trong Next.js

### API Connection Issues

1. Check API Gateway có running tại đúng port (8000)
2. Check network connectivity
3. Verify environment variables
4. Check browser console cho detailed errors

### Authentication Issues

1. Check JWT token format
2. Verify Kong JWT plugin configuration
3. Check token expiration
4. Verify public key setup in Kong

## Next Steps

1. Update UI components để sử dụng real API data
2. Implement error boundaries
3. Add loading states
4. Implement refresh token logic
5. Add offline support
6. Performance optimization

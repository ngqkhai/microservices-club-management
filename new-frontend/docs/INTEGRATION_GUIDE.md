# Tài liệu tích hợp Backend & API Gateway cho new-frontend

## 1. Tổng quan hệ thống

Hệ thống sử dụng kiến trúc microservices, các service chính:
- **auth-service**: Xác thực, quản lý người dùng.
- **club-service**: Quản lý câu lạc bộ.
- **event-service**: Quản lý sự kiện.
- **notify-service**: Thông báo.
- **api-gateway (Kong)**: Đóng vai trò cổng vào, định tuyến, xác thực, bảo mật, và inject thông tin user cho các service.

## 2. Cấu hình API Gateway (Kong)

### 2.1 Dockerfile

- Sử dụng image `kong:latest`.
- Cài đặt các plugin custom: `jwt-claims-headers`, `api-gateway-secret`.
- Đường dẫn plugin: `/usr/local/share/lua/5.1/kong/plugins/`.

### 2.2 kong.yml (Declarative Config)

#### 2.2.1 Services

| Service         | Internal URL                | Tags                  |
|-----------------|----------------------------|-----------------------|
| auth-service    | http://auth-service:3001    | auth                  |
| club-service    | http://club-service:3002    | club                  |
| event-service   | http://event-service:3003   | event                 |
| notify-service  | http://notify-service:3005  | notify                |

#### 2.2.2 Routes

- **Auth Public**: `/api/auth/login`, `/api/auth/register`, ... (không cần JWT)
- **Auth Protected**: `/api/auth/profile`, `/api/auth/change-password`, ... (cần JWT, inject header user)
- **Club Public**: `/api/clubs`, `/api/clubs/categories`, ... (GET, không cần JWT, có header secret)
- **Club Protected**: `/api/clubs` (POST, PUT, DELETE, cần JWT, inject header user, header secret)
- **Event/Notify**: `/api/events`, `/api/notifications` (cần JWT, inject header user)

#### 2.2.3 Plugins

- **jwt**: Xác thực JWT, kiểm tra claim `exp`, lấy public key từ `consumers`.
- **jwt-claims-headers**: Inject các claim (id, email, role) từ JWT vào header (ví dụ: `x-user-id`, `x-user-email`, `x-user-role`).
- **api-gateway-secret**: Inject header `x-api-gateway-secret` cho service-to-service.
- **cors**: Cho phép CORS từ frontend.
- **rate-limiting**: Giới hạn số request.

#### 2.2.4 Consumers

- Định nghĩa consumer `club-management-app` với public key xác thực JWT (RS256).

### 2.3 Custom Plugins

#### 2.3.1 jwt-claims-headers

- **Mục đích**: Lấy các claim từ JWT (id, email, role, ...) và inject vào header gửi lên backend.
- **Cấu hình**:
  - `claims_to_include`: Mảng các claim cần inject (ví dụ: `["id", "email", "role"]`).
  - `header_prefix`: Tiền tố header (mặc định: `x-user-`).
- **Cách hoạt động**:
  - Khi request có JWT hợp lệ, plugin sẽ decode payload, lấy các claim cấu hình, và set vào header tương ứng.
  - Ví dụ: Nếu JWT có `{ "id": "123", "email": "a@b.com", "role": "admin" }` thì backend sẽ nhận được các header:
    - `x-user-id: 123`
    - `x-user-email: a@b.com`
    - `x-user-role: admin`

#### 2.3.2 api-gateway-secret

- **Mục đích**: Thêm header `x-api-gateway-secret` vào mọi request đến backend, dùng cho xác thực nội bộ giữa gateway và service.
- **Cấu hình**: Không cần cấu hình.
- **Cách hoạt động**: Luôn set header `x-api-gateway-secret: club-mgmt-internal-secret-2024`.

## 3. Cấu hình docker-compose (liên quan đến frontend)

- **Kong expose các port**:
  - `8000`: HTTP proxy (frontend gọi API qua cổng này)
  - `8443`: HTTPS proxy
  - `8001`, `8444`: Admin API (không nên expose ra ngoài)
- **Frontend nên gọi API qua**: `http://localhost:8000` (hoặc domain tương ứng)
- **CORS**: Đã cấu hình cho phép từ `http://localhost:3000` (mặc định frontend dev).

## 4. Luồng xác thực & truyền thông tin user

1. **Đăng nhập**: Frontend gọi `/api/auth/login` (public, không cần JWT).
2. **Nhận JWT**: Frontend lưu JWT (access token).
3. **Gọi API protected**: Frontend gửi JWT qua header `Authorization: Bearer <token>`.
4. **Kong xác thực JWT**: Nếu hợp lệ, plugin `jwt-claims-headers` sẽ inject các thông tin user vào header.
5. **Backend nhận request**: Đọc thông tin user từ header (không cần decode JWT lại).

## 5. Tích hợp với frontend mới

- **Base URL API**: `http://localhost:8000`
- **Gửi JWT**: Luôn gửi header `Authorization: Bearer <token>` với các route cần xác thực.
- **Đọc thông tin user ở backend**: Đọc từ các header `x-user-id`, `x-user-email`, `x-user-role`.
- **Kiểm tra secret nội bộ**: Các service backend kiểm tra header `x-api-gateway-secret` để xác thực request đến từ gateway.

## 6. Tham khảo cấu hình mẫu

### Ví dụ gọi API từ frontend

```js
// Gọi API protected
fetch('http://localhost:8000/api/clubs', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <JWT>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ ... })
})
```

### Ví dụ backend đọc thông tin user

```js
// Express.js
const userId = req.headers['x-user-id'];
const userEmail = req.headers['x-user-email'];
const userRole = req.headers['x-user-role'];
```

---

## 7. Tài liệu tham khảo

- [Kong Plugins Documentation](https://docs.konghq.com/hub/)
- [Kong Declarative Config](https://docs.konghq.com/gateway/latest/kong-enterprise/kong-manager/declarative-config/)
- [Kong JWT Plugin](https://docs.konghq.com/hub/kong-inc/jwt/)

---

Nếu cần chi tiết về từng service backend hoặc ví dụ cụ thể hơn, hãy bổ sung yêu cầu! 
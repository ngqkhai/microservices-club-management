# Postman Collections - Event API Testing

Simple Postman collections for testing US-014 (Join Event) and US-015 (Leave Event) APIs.

## 📁 Collections

- **`US-014-Join-Event.postman_collection.json`** - Join Event test cases
- **`US-015-Leave-Event.postman_collection.json`** - Leave Event test cases

## 🚀 Quick Setup

### 1. Import Collections
1. Open **Postman**
2. Click **Import** → Select both JSON files
3. Import into Postman

### 2. Environment Variables
```
base_url = http://localhost:3003
user_id = test-user-123
user_email = test@example.com 
user_role = USER
event_id = 507f1f77bcf86cd799439011
```

### 3. Authentication Headers
All requests automatically include:
```
X-User-ID: {{user_id}}
X-User-Email: {{user_email}}
X-User-Role: {{user_role}}
```

## 🧪 Test Cases

### US-014 Join Event
1. ✅ **Success Case** - User joins available event
2. ❌ **Already Joined** - User tries to join again  
3. ❌ **Event Not Found** - Join non-existent event
4. ❌ **Invalid Event ID** - Malformed ObjectId
5. ❌ **Missing Auth** - Request without headers

### US-015 Leave Event  
1. ✅ **Success Case** - User leaves joined event
2. ❌ **Not Joined** - User tries to leave un-joined event
3. ❌ **Event Not Found** - Leave non-existent event
4. ❌ **Invalid Event ID** - Malformed ObjectId
5. ❌ **Missing Auth** - Request without headers

## 🎯 Usage

1. **Start Event Service**: `docker-compose up -d event-service`
2. **Setup Test Data**: `cd tests && node setup-test-data-quick.js`
3. **Run Collections**: Execute all requests in Postman
4. **Expected Results**: Success cases pass, error cases return proper error codes

For automated testing, use the Node.js scripts in the `tests/` directory instead.

Trong Postman, cấu hình các collection variables:

| Variable | Giá trị mặc định | Mô tả |
|----------|------------------|-------|
| `base_url` | `http://localhost:3003` | URL của Event Service |
| `event_id` | `67890abcdef1234567890123` | MongoDB ObjectId của event |
| `user_id` | `123e4567-e89b-12d3-a456-426614174000` | UUID của user |
| `user_email` | `test@example.com` | Email của user |

**Cách thay đổi variables:**
- Click vào collection name → Tab **Variables**
- Thay đổi **Current Value** của từng variable
- Click **Save**

### Bước 3: Chuẩn bị Environment

1. **Khởi động Event Service:**
   ```bash
   cd services/event
   npm install
   npm start
   ```

2. **Kiểm tra service chạy:**
   ```bash
   curl http://localhost:3003/health
   ```

3. **Tạo event test trong database** (nếu chưa có):
   - Event phải có status `PUBLISHED`
   - Event ID phải match với variable `event_id`

### Bước 4: Chạy Tests

Chạy **theo thứ tự** để test đúng flow:

1. **Test 1** - Join Event thành công ✅
2. **Test 2** - User đã join rồi ❌  
3. **Test 3** - Event không tồn tại ❌
4. **Test 4** - Thiếu authentication ❌
5. **Test 5** - User khác join cùng event ✅

## 📋 Chi tiết Test Cases

### ✅ Test 1: Join Event Success (200)

**Request:**
```http
POST /api/events/67890abcdef1234567890123/join
x-user-id: 123e4567-e89b-12d3-a456-426614174000
x-user-role: USER
x-user-email: test@example.com
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Joined event successfully",
  "data": {
    "eventId": "67890abcdef1234567890123",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "joinedAt": "2025-07-04T12:00:00.000Z",
    "eventTitle": "Sample Event",
    "eventStartAt": "2025-07-15T10:00:00.000Z"
  }
}
```

### ❌ Test 2: Already Joined (400)

Same user join lần 2:

**Expected Response:**
```json
{
  "status": 400,
  "error": "ALREADY_JOINED", 
  "message": "You already joined this event"
}
```

### ❌ Test 3: Event Not Found (404)

Join event không tồn tại:

**Expected Response:**
```json
{
  "status": 404,
  "error": "EVENT_NOT_FOUND",
  "message": "Event not found"
}
```

### ❌ Test 4: No Authentication (401)

Request không có headers:

**Expected Response:**
```json
{
  "success": false,
  "message": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

### ✅ Test 5: Different User Joins (200)

User khác join cùng event (thành công):

**Request:**
```http
POST /api/events/67890abcdef1234567890123/join
x-user-id: 123e4567-e89b-12d3-a456-426614174001
x-user-role: USER  
x-user-email: user2@example.com
```

**Expected Response:** Tương tự Test 1 nhưng với `userId` khác

## 🔧 Postman Test Scripts

Mỗi request có built-in test scripts để validate:

- **Status codes** (200, 400, 404, 401)
- **Response structure** 
- **Error codes** (`ALREADY_JOINED`, `EVENT_NOT_FOUND`)
- **Success messages**

Kết quả test sẽ hiển thị trong **Test Results** tab của Postman.

## 🐛 Troubleshooting

### 1. Service không chạy
```bash
# Kiểm tra health endpoint
curl http://localhost:3003/health

# Expected: {"status": "ok", "service": "event-service"}
```

### 2. Event không tồn tại  
- Kiểm tra `event_id` trong variables có đúng format MongoDB ObjectId
- Đảm bảo event tồn tại trong database với status `PUBLISHED`

### 3. Database connection
- Kiểm tra MongoDB service đang chạy
- Kiểm tra connection string trong `.env`

### 4. Authentication errors
- Đảm bảo headers `x-user-id`, `x-user-role`, `x-user-email` được gửi
- Kiểm tra `user_id` có đúng format UUID
- Kiểm tra `user_role` là `USER` hoặc `ADMIN`

### 5. Winston/Logger errors
```bash
# Install dependencies
cd services/event
npm install

# Install shared dependencies  
cd ../../shared
npm install
```

## 📝 Notes

- **Test Order:** Quan trọng phải chạy Test 1 trước Test 2 để test "already joined"
- **User IDs:** Test 5 dùng user ID khác để test multiple users
- **Authentication:** Dùng API Gateway headers thay vì JWT tokens
- **Database:** Cần MongoDB với event data để test thành công

---

**Version:** 1.0.0  
**Last Updated:** July 4, 2025  
**API Version:** US-014 Join Event

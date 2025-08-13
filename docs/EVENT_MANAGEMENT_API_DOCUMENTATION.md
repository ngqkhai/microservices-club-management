# Event Management API Documentation

Tài liệu API cho các endpoint quản lý sự kiện trong Club Management System.

## Base URL
```
http://localhost:8080/api
```

## Authentication
Tất cả các endpoint yêu cầu authentication thông qua API Gateway với headers:
- `x-api-gateway-secret`: Secret key cho API Gateway
- `x-user-id`: ID của user
- `x-user-email`: Email của user  
- `x-user-role`: Role của user
- `x-user-full-name`: Tên đầy đủ của user

---

## 1. Tạo Event Mới

### Endpoint
```
POST /api/events
```

### Authorization
- **Roles required**: Club Manager, Event Organizer
- **Middleware**: `authMiddleware`, `requireClubManagerOrOrganizer`

### Request Body
```json
{
  "club_id": "ObjectId",
  "title": "string (required, max 200 chars)",
  "description": "string (max 2000 chars)",
  "short_description": "string (max 500 chars)",
  "category": "Workshop|Seminar|Competition|Social|Fundraiser|Meeting|Other",
  "location": {
    "location_type": "physical|virtual|hybrid",
    "address": "string (max 500 chars)",
    "room": "string (max 100 chars)",
    "virtual_link": "string (max 500 chars)",
    "coordinates": {
      "lat": "number",
      "lng": "number"
    }
  },
  "start_date": "ISO Date (required)",
  "end_date": "ISO Date (required)",
  "start_time": "HH:MM format (optional)",
  "end_time": "HH:MM format (optional)",
  "registration_deadline": "ISO Date",
  "max_participants": "number (min 1)",
  "participation_fee": "number (default 0, min 0)",
  "currency": "string (3 chars, default USD)",
  "requirements": ["string array"],
  "tags": ["string array"],
  "images": ["string array - URLs"],
  "event_image_url": "string (HTTP/HTTPS URL)",
  "event_logo_url": "string (HTTP/HTTPS URL)",
  "attachments": ["object array"],
  "status": "draft|published|cancelled|completed",
  "visibility": "public|private|members_only",
  "organizers": ["ObjectId array"]
}
```

### Response Success (201)
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "club_id": "ObjectId",
    "title": "Event Title",
    "description": "Event Description",
    "category": "Workshop",
    "location": {
      "location_type": "physical",
      "address": "123 Main St",
      "room": "Room A"
    },
    "start_date": "2025-08-20T10:00:00.000Z",
    "end_date": "2025-08-20T18:00:00.000Z",
    "max_participants": 50,
    "participation_fee": 0,
    "currency": "USD",
    "status": "published",
    "visibility": "public",
    "created_by": "user_id",
    "created_at": "2025-08-13T10:00:00.000Z",
    "updated_at": "2025-08-13T10:00:00.000Z"
  }
}
```

### Response Error (400)
```json
{
  "success": false,
  "message": "Validation error message",
  "code": "VALIDATION_ERROR"
}
```

---

## 2. Cập Nhật Event

### Endpoint
```
PUT /api/events/:id
```

### Authorization
- **Roles required**: Club Manager, Event Organizer
- **Middleware**: `authMiddleware`, `requireClubManagerOrOrganizer`

### URL Parameters
- `id` (required): ObjectId của event cần cập nhật

### Request Body
```json
{
  "title": "string (max 200 chars)",
  "description": "string (max 2000 chars)",
  "short_description": "string (max 500 chars)",
  "category": "Workshop|Seminar|Competition|Social|Fundraiser|Meeting|Other",
  "location": {
    "location_type": "physical|virtual|hybrid",
    "address": "string (max 500 chars)",
    "room": "string (max 100 chars)",
    "virtual_link": "string (max 500 chars)",
    "coordinates": {
      "lat": "number",
      "lng": "number"
    }
  },
  "start_date": "ISO Date",
  "end_date": "ISO Date",
  "start_time": "HH:MM format",
  "end_time": "HH:MM format",
  "registration_deadline": "ISO Date",
  "max_participants": "number (min 1)",
  "participation_fee": "number (min 0)",
  "currency": "string (3 chars)",
  "requirements": ["string array"],
  "tags": ["string array"],
  "images": ["string array - URLs"],
  "event_image_url": "string (HTTP/HTTPS URL)",
  "event_logo_url": "string (HTTP/HTTPS URL)",
  "status": "draft|published|cancelled|completed",
  "visibility": "public|private|members_only"
}
```

**Lưu ý**: 
- Không thể thay đổi `club_id` của event
- `start_date` phải là ngày trong tương lai
- `end_date` phải sau `start_date`

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "club_id": "ObjectId",
    "title": "Updated Event Title",
    "description": "Updated Description",
    // ... other updated fields
    "updated_at": "2025-08-13T11:00:00.000Z"
  }
}
```

### Response Error (404)
```json
{
  "status": 404,
  "error": "EVENT_NOT_FOUND",
  "message": "Event not found"
}
```

### Response Error (400)
```json
{
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Event start_at must be a future date."
}
```

---

## 3. Xóa Event

### Endpoint
```
DELETE /api/events/:id
```

### Authorization
- **Roles required**: Club Manager, Event Organizer
- **Middleware**: `authMiddleware`, `requireClubManagerOrOrganizer`

### URL Parameters
- `id` (required): ObjectId của event cần xóa

### Request Body
Không cần body

### Response Success (200)
```json
{
  "status": "success",
  "message": "Event deleted successfully"
}
```

### Response Error (404)
```json
{
  "status": 404,
  "error": "EVENT_NOT_FOUND",
  "message": "Event not found"
}
```

### Response Error (503)
```json
{
  "status": 503,
  "error": "SERVICE_UNAVAILABLE",
  "message": "Service temporarily unavailable. Please try again later."
}
```

---

## 4. Lấy Trạng Thái Event của User

### Endpoint
```
GET /api/events/:id/user-status
```

### Authorization
- **Roles required**: Authenticated User
- **Middleware**: `authMiddleware`, `requireUser`

### URL Parameters
- `id` (required): ObjectId của event

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "event_id": "ObjectId",
    "user_id": "string",
    "is_registered": true,
    "is_favorited": false,
    "registration_status": "registered|attended|cancelled",
    "registration_date": "2025-08-13T10:00:00.000Z",
    "ticket_id": "uuid-string"
  }
}
```

### Response Error (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## 5. Toggle Favorite Event

### Endpoint
```
POST /api/events/:id/favorite
```

### Authorization
- **Roles required**: Authenticated User
- **Middleware**: `authMiddleware`, `requireUser`

### URL Parameters
- `id` (required): ObjectId của event

### Request Body
Không cần body

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "event_id": "ObjectId",
    "user_id": "string",
    "is_favorited": true
  },
  "message": "Event added to favorites"
}
```

Hoặc khi remove khỏi favorites:
```json
{
  "success": true,
  "data": {
    "event_id": "ObjectId",
    "user_id": "string",
    "is_favorited": false
  },
  "message": "Event removed from favorites"
}
```

### Response Error (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## 6. Lấy Danh Sách Event Yêu Thích của User

### Endpoint
```
GET /api/users/favorite-events
```

### Authorization
- **Roles required**: Authenticated User
- **Middleware**: `authMiddleware`, `requireUser`

### Query Parameters
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số item per page (default: 10)

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "_id": "ObjectId",
        "club_id": "ObjectId",
        "title": "Favorite Event 1",
        "description": "Event Description",
        "category": "Workshop",
        "location": {
          "location_type": "physical",
          "address": "123 Main St"
        },
        "start_date": "2025-08-20T10:00:00.000Z",
        "end_date": "2025-08-20T18:00:00.000Z",
        "participation_fee": 0,
        "currency": "USD",
        "status": "published",
        "favorited_at": "2025-08-13T10:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 45,
      "items_per_page": 10
    }
  }
}
```

### Response Error (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## 7. Lấy Danh Sách Đăng Ký Event

### Endpoint
```
GET /api/events/:id/registrations
```

### Authorization
- **Roles required**: Club Manager, Event Organizer
- **Middleware**: `authMiddleware`, `requireClubManagerOrOrganizer`

### URL Parameters
- `id` (required): ObjectId của event

### Query Parameters
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số item per page (default: 20)
- `status` (optional): Filter theo trạng thái registration: `registered|attended|cancelled`

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "registrations": [
      {
        "_id": "ObjectId",
        "event_id": "ObjectId",
        "user_id": "string",
        "user_email": "user@example.com",
        "user_name": "John Doe",
        "ticket_id": "uuid-string",
        "status": "registered",
        "registration_data": {
          "answers": [],
          "special_requirements": "Dietary restrictions: Vegetarian"
        },
        "payment_info": {
          "status": "paid",
          "amount": 25.00,
          "transaction_id": "txn_123"
        },
        "ticket_info": {
          "qr_code": "encoded-qr-string",
          "issued_at": "2025-08-13T10:00:00.000Z",
          "check_in_time": null
        },
        "registered_at": "2025-08-13T10:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 45,
      "items_per_page": 20
    },
    "summary": {
      "total_registered": 45,
      "total_attended": 0,
      "total_cancelled": 2
    }
  }
}
```

### Response Error (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## 8. Cập Nhật Trạng Thái Đăng Ký Event

### Endpoint
```
PUT /api/events/:id/registrations/:regId/status
```

### Authorization
- **Roles required**: Club Manager, Event Organizer
- **Middleware**: `authMiddleware`, `requireClubManagerOrOrganizer`

### URL Parameters
- `id` (required): ObjectId của event
- `regId` (required): ObjectId của registration record

### Request Body
```json
{
  "status": "registered|attended|cancelled"
}
```

### Response Success (200)
```json
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "event_id": "ObjectId",
    "user_id": "string",
    "user_email": "user@example.com",
    "user_name": "John Doe",
    "ticket_id": "uuid-string",
    "status": "attended",
    "ticket_info": {
      "check_in_time": "2025-08-20T10:30:00.000Z"
    },
    "updated_at": "2025-08-20T10:30:00.000Z"
  }
}
```

### Response Error (400)
```json
{
  "success": false,
  "message": "Invalid status value",
  "code": "VALIDATION_ERROR"
}
```

### Response Error (404)
```json
{
  "success": false,
  "message": "Registration not found",
  "code": "REGISTRATION_NOT_FOUND"
}
```

---

## Error Codes Reference

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request data validation failed |
| `EVENT_NOT_FOUND` | Event with specified ID not found |
| `REGISTRATION_NOT_FOUND` | Registration record not found |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |
| `INTERNAL_ERROR` | Internal server error |
| `UNAUTHORIZED` | User not authenticated |
| `FORBIDDEN` | User doesn't have required permissions |

## Status Codes Reference

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad Request - validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Event Categories

- `Workshop` - Hội thảo, workshop
- `Seminar` - Seminar, buổi thuyết trình
- `Competition` - Cuộc thi, competition
- `Social` - Sự kiện xã hội, giao lưu
- `Fundraiser` - Sự kiện gây quỹ
- `Meeting` - Họp, meeting
- `Other` - Khác

## Event Status

- `draft` - Bản nháp, chưa công bố
- `published` - Đã công bố, mở đăng ký
- `cancelled` - Đã hủy
- `completed` - Đã hoàn thành

## Event Visibility

- `public` - Công khai cho tất cả
- `private` - Riêng tư, chỉ theo mời
- `members_only` - Chỉ thành viên club

## Registration Status

- `registered` - Đã đăng ký
- `attended` - Đã tham dự (check-in)
- `cancelled` - Đã hủy đăng ký

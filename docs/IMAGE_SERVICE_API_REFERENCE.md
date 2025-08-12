# 🔗 Image Service API Reference

## Base URL
```
Production: https://your-domain.com
Development: http://localhost:8000
```

## 🔐 Authentication
All endpoints require:
- **Authorization**: `Bearer <jwt_token>`
- **X-API-Gateway-Secret**: `<api_gateway_secret>`

## 📋 Endpoints

### 1. Upload Single Image
**POST** `/api/images/upload`

**Headers:**
```
Authorization: Bearer <jwt_token>
X-API-Gateway-Secret: <secret>
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | File | ✅ | Image file (max 10MB) |
| `type` | String | ✅ | Image type: `profile`, `logo`, `cover`, `event_image`, `event_logo`, `event` |
| `entity_id` | String | ✅ | ID of the entity (club_id, event_id, user_id) |
| `entity_type` | String | ✅ | Entity type: `club`, `event`, `user` |
| `folder` | String | ❌ | Custom folder path (default: `club_management`) |

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/images/upload \
  -H "Authorization: Bearer your_jwt_token" \
  -H "X-API-Gateway-Secret: your_secret" \
  -F "image=@logo.png" \
  -F "type=logo" \
  -F "entity_id=club123" \
  -F "entity_type=club" \
  -F "folder=club_management/clubs"
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id": "club_management/clubs/logo_xyz123",
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/club_management/clubs/logo_xyz123.png",
    "public_id": "club_management/clubs/logo_xyz123",
    "format": "png",
    "width": 500,
    "height": 500,
    "size": 45678,
    "type": "logo",
    "folder": "club_management/clubs",
    "original_name": "logo.png",
    "uploaded_at": "2025-01-01T12:00:00.000Z"
  }
}
```

---

### 2. Upload Multiple Images
**POST** `/api/images/upload/bulk`

**Headers:**
```
Authorization: Bearer <jwt_token>
X-API-Gateway-Secret: <secret>
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `images` | File[] | ✅ | Array of image files (max 10 files, 10MB each) |
| `type` | String | ✅ | Image type: `event`, `gallery` |
| `entity_id` | String | ✅ | ID of the entity |
| `entity_type` | String | ✅ | Entity type: `event` |
| `folder` | String | ❌ | Custom folder path |

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/images/upload/bulk \
  -H "Authorization: Bearer your_jwt_token" \
  -H "X-API-Gateway-Secret: your_secret" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg" \
  -F "images=@image3.jpg" \
  -F "type=event" \
  -F "entity_id=event123" \
  -F "entity_type=event"
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "3 images uploaded successfully",
  "data": [
    {
      "id": "club_management/events/image1_abc123",
      "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/club_management/events/image1_abc123.jpg",
      "public_id": "club_management/events/image1_abc123",
      "format": "jpg",
      "width": 1920,
      "height": 1080,
      "size": 234567,
      "type": "event",
      "original_name": "image1.jpg",
      "uploaded_at": "2025-01-01T12:00:00.000Z"
    },
    // ... more images
  ]
}
```

---

### 3. Delete Image
**DELETE** `/api/images/{public_id}`

**Headers:**
```
Authorization: Bearer <jwt_token>
X-API-Gateway-Secret: <secret>
```

**Example Request:**
```bash
curl -X DELETE http://localhost:8000/api/images/club_management/clubs/logo_xyz123 \
  -H "Authorization: Bearer your_jwt_token" \
  -H "X-API-Gateway-Secret: your_secret"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": {
    "result": "ok"
  }
}
```

---

### 4. Get Image Info
**GET** `/api/images/{public_id}`

**Headers:**
```
Authorization: Bearer <jwt_token>
X-API-Gateway-Secret: <secret>
```

**Example Request:**
```bash
curl -X GET http://localhost:8000/api/images/club_management/clubs/logo_xyz123 \
  -H "Authorization: Bearer your_jwt_token" \
  -H "X-API-Gateway-Secret: your_secret"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "public_id": "club_management/clubs/logo_xyz123",
    "format": "png",
    "version": 1234567890,
    "resource_type": "image",
    "type": "upload",
    "created_at": "2025-01-01T12:00:00Z",
    "bytes": 45678,
    "width": 500,
    "height": 500,
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/club_management/clubs/logo_xyz123.png",
    "secure_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/club_management/clubs/logo_xyz123.png"
  }
}
```

---

### 5. Health Check
**GET** `/api/images/health`

**Headers:**
```
X-API-Gateway-Secret: <secret>
```

**Example Request:**
```bash
curl -X GET http://localhost:8000/api/images/health \
  -H "X-API-Gateway-Secret: your_secret"
```

**Success Response (200):**
```json
{
  "status": "OK",
  "service": "image-service",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "uptime": 3600.123
}
```

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "No image file provided"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required: User ID not found"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied: You must be a club manager or organizer to upload club images"
}
```

### 413 Payload Too Large
```json
{
  "success": false,
  "error": "File too large",
  "maxSize": "10MB"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to upload image: Invalid Signature"
}
```

## 📝 Image Types & Permissions

| Image Type | Entity Type | Who Can Upload | Database Field Updated |
|------------|-------------|----------------|------------------------|
| `profile` | `user` | Own profile only | `users.profile_picture_url` |
| `logo` | `club` | Club manager/organizer | `clubs.logo_url` |
| `cover` | `club` | Club manager/organizer | `clubs.cover_url` |
| `event_image` | `event` | Event creator/organizer, Club manager/organizer | `events.event_image_url` |
| `event_logo` | `event` | Event creator/organizer, Club manager/organizer | `events.event_logo_url` |
| `event` | `event` | Event creator/organizer, Club manager/organizer | `events.images[]` (array) |

## 🔄 RabbitMQ Events

After successful upload, the image service publishes events to RabbitMQ:

**Exchange**: `image_events`
**Routing Keys**:
- `image.profile` → Auth service updates user
- `image.logo` → Club service updates club
- `image.cover` → Club service updates club
- `image.event_image` → Event service updates event
- `image.event_logo` → Event service updates event
- `image.event` → Event service updates event

**Event Payload**:
```json
{
  "event_type": "image_uploaded",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "data": {
    "id": "club_management/clubs/logo_xyz123",
    "url": "https://res.cloudinary.com/your-cloud/...",
    "public_id": "club_management/clubs/logo_xyz123",
    "type": "logo",
    "entity_id": "club123",
    "entity_type": "club",
    "uploaded_at": "2025-01-01T12:00:00.000Z"
  }
}
```

## 📏 File Limits

- **Max file size**: 10MB per image
- **Max files per bulk upload**: 10 images
- **Supported formats**: JPEG, JPG, PNG, GIF, WebP
- **Rate limit**: 100 requests per 15 minutes per IP

## 🌐 Environment Variables

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_GATEWAY_SECRET=your_secret_here
```

**Backend (.env)**:
```env
API_GATEWAY_SECRET=your_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

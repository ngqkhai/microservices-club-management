# Image Service

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)

> **Image Upload microservice** - Handles image uploads, storage, and CDN delivery with pluggable storage providers (Cloudinary for production, MinIO/S3 for local development) for the Club Management System.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Key Endpoints](#-key-endpoints)
- [Environment Variables](#-environment-variables)
- [Event-Driven Architecture](#-event-driven-architecture)
- [Run with Docker](#-run-with-docker)
- [Storage Providers](#-storage-providers)
- [Health Checks](#-health-checks)

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js 4.x |
| **File Upload** | Multer |
| **Cloud Storage** | Cloudinary SDK |
| **Local Storage** | MinIO (S3-compatible) |
| **Message Queue** | RabbitMQ (amqplib) |
| **Validation** | Joi |
| **Logging** | Winston + Daily Rotate |
| **Security** | Helmet, express-rate-limit |

---

## 🔗 Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/images/upload` | Upload a single image |
| `POST` | `/api/images/upload/bulk` | Upload multiple images (up to 10) |
| `DELETE` | `/api/images/:id` | Delete an image |
| `GET` | `/health` | Full health check with storage status |
| `GET` | `/ready` | Kubernetes readiness probe |
| `GET` | `/live` | Kubernetes liveness probe |

### Upload Request

```bash
curl -X POST http://localhost:3004/api/images/upload \
  -H "x-api-gateway-secret: your-secret" \
  -H "x-user-id: user-uuid" \
  -F "image=@/path/to/image.jpg" \
  -F "entity_type=user_profile" \
  -F "entity_id=user-uuid"
```

### Upload Response

```json
{
  "success": true,
  "data": {
    "url": "https://cdn.example.com/images/abc123.jpg",
    "public_id": "abc123",
    "width": 800,
    "height": 600,
    "format": "jpg",
    "size": 125000
  }
}
```

---

## 🔐 Environment Variables

Create a `.env` file based on `env.example`:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment (development/test/production) | No | `development` |
| `PORT` | Service port | No | `3004` |
| **Storage Provider** ||||
| `STORAGE_PROVIDER` | Provider selection (auto/cloudinary/minio/s3) | No | `auto` |
| **Cloudinary (Production)** ||||
| `CLOUDINARY_CLOUD_NAME` | 🔒 Cloudinary cloud name | Yes* | - |
| `CLOUDINARY_API_KEY` | 🔒 Cloudinary API key | Yes* | - |
| `CLOUDINARY_API_SECRET` | 🔒 Cloudinary API secret | Yes* | - |
| **MinIO (Local Dev)** ||||
| `MINIO_ENDPOINT` | MinIO server hostname | No | `minio` |
| `MINIO_PORT` | MinIO server port | No | `9000` |
| `MINIO_ACCESS_KEY` | 🔒 MinIO access key | No | `minioadmin` |
| `MINIO_SECRET_KEY` | 🔒 MinIO secret key | No | `minioadmin_local_dev` |
| `MINIO_BUCKET_NAME` | Bucket name | No | `club-management` |
| `MINIO_USE_SSL` | Use SSL for MinIO | No | `false` |
| **RabbitMQ** ||||
| `RABBITMQ_URL` | RabbitMQ connection URL | No | `amqp://localhost:5672` |
| `RABBITMQ_EXCHANGE` | Exchange name | No | `club_events` |
| **Security** ||||
| `API_GATEWAY_SECRET` | 🔒 Secret for gateway validation (min 16 chars) | **Yes** | - |
| **Upload Limits** ||||
| `MAX_FILE_SIZE` | Max file size in bytes | No | `5242880` (5MB) |
| `ALLOWED_FILE_TYPES` | Comma-separated MIME types | No | `image/jpeg,image/png,image/gif,image/webp` |
| **Rate Limiting** ||||
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | No | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | `100` |
| **Logging** ||||
| `LOG_LEVEL` | Log level (error/warn/info/debug) | No | `info` |

> 🔒 = Sensitive variable - never commit to version control  
> \* = Required if using Cloudinary (`STORAGE_PROVIDER=cloudinary`)

---

## 📨 Event-Driven Architecture

### Events Published (to RabbitMQ)

| Event | Routing Key | Description | Consumers |
|-------|-------------|-------------|-----------|
| Image Uploaded | `image.uploaded` | When an image is successfully uploaded | auth-service, club-service, event-service |
| Image Deleted | `image.deleted` | When an image is deleted | - |

### Event Payload (`image.uploaded`)

```json
{
  "id": "uuid",
  "type": "image.uploaded",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "entity_type": "user_profile",
    "entity_id": "user-uuid",
    "image_url": "https://cdn.example.com/images/abc123.jpg",
    "public_id": "abc123",
    "uploaded_by": "user-uuid"
  }
}
```

### Entity Types

| Type | Description | Consumer |
|------|-------------|----------|
| `user_profile` | User profile picture | auth-service |
| `club_logo` | Club logo image | club-service |
| `club_cover` | Club cover image | club-service |
| `event_cover` | Event cover image | event-service |
| `event_gallery` | Event gallery images | event-service |

---

## 🐳 Run with Docker

### Build the Image

```bash
cd services/image
docker build -t club-management/image-service:latest .
```

### Run with MinIO (Local Development)

```bash
docker run -d \
  --name image-service \
  -p 3004:3004 \
  -e NODE_ENV=development \
  -e STORAGE_PROVIDER=minio \
  -e MINIO_ENDPOINT=minio \
  -e MINIO_ACCESS_KEY=minioadmin \
  -e MINIO_SECRET_KEY=minioadmin_local_dev \
  -e API_GATEWAY_SECRET=your-secret-min-16-characters \
  -e RABBITMQ_URL=amqp://rabbitmq:5672 \
  club-management/image-service:latest
```

### Run with Cloudinary (Production)

```bash
docker run -d \
  --name image-service \
  -p 3004:3004 \
  -e NODE_ENV=production \
  -e STORAGE_PROVIDER=cloudinary \
  -e CLOUDINARY_CLOUD_NAME=your-cloud-name \
  -e CLOUDINARY_API_KEY=your-api-key \
  -e CLOUDINARY_API_SECRET=your-api-secret \
  -e API_GATEWAY_SECRET=your-secret-min-16-characters \
  -e RABBITMQ_URL=amqp://rabbitmq:5672 \
  club-management/image-service:latest
```

### Docker Compose (Recommended)

```bash
# From project root
docker-compose up image-service
```

---

## 📦 Storage Providers

The service supports multiple storage providers with automatic selection:

### Auto-Detection (`STORAGE_PROVIDER=auto`)

1. If Cloudinary credentials are configured → Uses Cloudinary
2. If MinIO endpoint is configured → Uses MinIO
3. Default → Falls back to MinIO

### Cloudinary (Production)

- Global CDN with automatic optimization
- Responsive images (on-the-fly resizing)
- AI-powered cropping
- Best for production deployments

### MinIO (Local Development)

- S3-compatible object storage
- Runs locally in Docker
- No external dependencies
- Perfect for development/testing

**MinIO Console:** `http://localhost:9001` (login: `minioadmin` / `minioadmin_local_dev`)

---

## ❤️ Health Checks

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Full health check with storage status |
| `GET /ready` | Kubernetes readiness probe (checks storage) |
| `GET /live` | Kubernetes liveness probe |

### Health Check Response

```json
{
  "status": "OK",
  "service": "image-service",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "storage": {
    "provider": "minio",
    "initialized": true,
    "healthy": true,
    "bucket": "club-management"
  }
}
```

---

## 📁 Project Structure

```
services/image/
├── src/
│   ├── config/           # Configuration management
│   │   ├── index.js      # Joi-validated config
│   │   ├── logger.js     # Winston logger
│   │   ├── rabbitmq.js   # RabbitMQ connection
│   │   └── storage/      # Storage abstraction
│   │       ├── index.js             # Factory
│   │       ├── StorageProvider.js   # Interface
│   │       ├── CloudinaryProvider.js
│   │       └── MinioProvider.js
│   ├── controllers/      # Request handlers
│   ├── middlewares/      # Auth, upload (multer)
│   ├── routes/           # Express routes
│   ├── services/         # Business logic
│   │   └── imageService.js
│   └── server.js         # App entry point
├── Dockerfile
├── package.json
└── env.example
```

---

## 🔧 Storage Provider Interface

All storage providers implement:

```javascript
class StorageProvider {
  async initialize()           // Setup connection/bucket
  async uploadFile(file, opts) // Upload file, return URL + metadata
  async deleteFile(publicId)   // Delete file by ID
  async getFileInfo(publicId)  // Get file metadata
  async healthCheck()          // Provider health status
}
```

---

*Last Updated: November 2024*


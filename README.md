# Cl## 📖 Documentation

- **[📋 Complete Developer Guide](./COMPLETE_DEVELOPER_GUIDE.md)** - **COMPLETE SETUP GUIDE** for fresh OS installation with all steps from prerequisites to production
- **[🔄 PM2 Process Management](./PM2_GUIDE.md)** - Detailed PM2 usage and management
- **[✅ Setup Summary](./PM2_SETUP_COMPLETE.md)** - Quick reference after setupnagement System

A comprehensive microservices-based club management platform built with Node.js, Express.js, and Next.js.

## � Documentation

- **[�🚀 Developer Setup Guide](./DEVELOPER_SETUP_GUIDE.md)** - Complete setup guide for fresh OS installation
- **[🔄 PM2 Process Management](./PM2_GUIDE.md)** - Detailed PM2 usage and management
- **[✅ Setup Complete](./PM2_SETUP_COMPLETE.md)** - Quick reference after setup

## 🚀 Quick Start (After Setup)

### Prerequisites Installed
- Node.js 18+ and npm
- PostgreSQL and/or MongoDB
- Git and PM2

### One-Command Start
```bash
# If already set up, just start all services
npm run dev

# Check service status
npm run dev:status

# View logs
npm run dev:logs

# Monitor services
npm run dev:monit
```

### Available Services
- **Frontend** (Next.js) - http://localhost:3000
- **Auth Service** - http://localhost:3001
- **Club Service** - http://localhost:3002  
- **Event Service** - http://localhost:3003
- **Finance Service** - http://localhost:3004
- **Notify Service** - http://localhost:3005
- **User Service** - http://localhost:3006

### Management Commands
```bash
# Development
npm run dev              # Start all services
npm run dev:stop         # Stop all services
npm run dev:restart      # Restart all services
npm run dev:logs         # View logs
npm run dev:status       # Check status
npm run dev:monit        # Monitoring dashboard

# Production
npm start                # Start in production mode
npm run health:check     # Comprehensive health check
npm run health:watch     # Continuous health monitoring
```

**🆕 New to the project?** See the **[Complete Developer Guide](./COMPLETE_DEVELOPER_GUIDE.md)** for step-by-step setup instructions from scratch.

## 🧱 1. Tổng Quan Kiến Trúc & Cấu Trúc Thư Mục

Dự án được tổ chức theo mô hình microservices, gồm các thành phần chính:

- **frontend/**: Ứng dụng React giao tiếp với API Gateway.
- **api-gateway/**: Cổng API chính, định tuyến request đến các service.
- **services/**: Các microservice độc lập, mỗi service đảm nhiệm một chức năng riêng biệt:
  - **user-service/**
  - **club-service/**
  - **event-service/**
  - **finance-service/**
  - **report-service/**
  - **notification-service/**
- **shared/**: Tiện ích và hằng số dùng chung
- **docker-compose.yml**: Quản lý các service khi phát triển đồng bộ
- **Databases**: Mỗi service có một cơ sở dữ liệu riêng
- **Integrations**: Momo SDK, EmailJS/SendGrid, Twilio, QRCode.js, jsPDF

### 📁 Cấu trúc thư mục chi tiết cho từng microservice

```
<service-name>/
├── src/
│   ├── controllers/    # Xử lý logic từ request
│   ├── routes/         # Khai báo endpoint
│   ├── models/         # Sequelize models hoặc Mongoose schema
│   ├── services/       # Business logic (xử lý DB hoặc tích hợp ngoài)
│   ├── middlewares/    # Xác thực, RBAC nội bộ
│   ├── config/         # Cấu hình DB, .env loader
│   ├── utils/          # Tiện ích dùng chung (format date, email...)
│   ├── database/       # Migration, seeders nếu có
│   ├── app.js          # Khởi tạo express app
│   └── server.js       # Chạy server
├── .env                # Biến môi trường riêng
├── Dockerfile          # Docker build file
├── package.json        # Thông tin package Node.js
└── README.md           # Tài liệu riêng cho service
```

### 📁 Cấu trúc thư mục cho API Gateway

```
api-gateway/
├── src/
│   ├── middlewares/    # JWT, RBAC middleware
│   ├── routes/         # Tuyến điều phối đến các service
│   ├── services/       # Các hàm gọi các microservices (REST API)
│   ├── utils/          # Hàm tiện ích (logger, error handler)
│   ├── config/         # Biến môi trường, cổng dịch vụ
│   ├── app.js          # Khởi tạo express app
│   └── server.js       # Khởi chạy server
├── .env
├── package.json
└── README.md
```

### 📁 Cấu trúc thư mục cho shared
```
shared/
├── utils/              # Hàm tiện ích dùng chung (auth, validate, config)
└── constants/          # Hằng số (roles, status, ...)
```

### 📁 Cấu trúc tổng thể
```
club-management-system/
├── frontend/
├── api-gateway/
├── services/
│   ├── user-service/
│   ├── club-service/
│   ├── event-service/
│   ├── finance-service/
│   ├── report-service/
│   └── notification-service/
├── shared/
│   ├── utils/
│   └── constants/
├── docker-compose.yml
└── README.md
```

## ⚙️ 2. Cấu hình kỹ thuật từng phần

### 1. frontend/
- **Công nghệ:** ReactJS, Redux Toolkit, Axios
- **Cấu trúc:**
  - `src/`
    - `components/`: Các thành phần UI
    - `pages/`: Các trang chính
    - `services/`: Gọi API
    - `store/`: Quản lý state
    - `utils/`: Tiện ích frontend
- **Cấu hình:**
  - `.env`: Biến môi trường (API_URL, ...)


### 2. services/
- **Công nghệ:** Node.js (Express/Fastify), MongoDB/PostgreSQL, Redis (nếu cần)
- **Cấu trúc chung:**
  - `src/`
    - `controllers/`: Xử lý logic request
    - `models/`: Định nghĩa schema DB
    - `routes/`: Định tuyến API
    - `services/`: Logic nghiệp vụ
    - `utils/`: Tiện ích riêng service
    - `config/`: Cấu hình DB, service
  - `.env`: Biến môi trường riêng từng service

### 🔐 User Service
- **Chức năng:** Đăng ký, đăng nhập, phân quyền RBAC
- **Tech:** Express, JWT, Sequelize, MySQL
- **Endpoints:**
  - `POST /register`
  - `POST /login`
  - `GET /profile`
- **Database:** Bảng `Users`

### 👥 Club Service
- **Chức năng:** Quản lý CLB, thành viên CLB
- **Endpoints:**
  - `POST /clubs`
  - `GET /clubs`
  - `POST /clubs/:id/members`
- **Database:** Bảng `Clubs`, `ClubMembership`

### 📅 Event Service
- **Chức năng:** Tạo sự kiện, RSVP, check-in QR
- **Tích hợp:** QRCode.js, Google Calendar iCal URL
- **Endpoints:**
  - `POST /events`
  - `POST /events/:id/rsvp`
- **Database:** Bảng `Events`, `RSVPs`

### 💰 Finance Service
- **Chức năng:** Xử lý thanh toán Momo, tạo hóa đơn
- **Tích hợp:** Momo SDK
- **Database:** Bảng `Transactions`, `Invoices`

### 📊 Report Service
- **Chức năng:** Báo cáo tham gia, tài chính, tương tác
- **Tích hợp:** jsPDF, XLSX, Chart.js
- **Endpoints:**
  - `GET /reports/finance`
  - `GET /reports/attendance`

### 📢 Notification Service
- **Chức năng:** Gửi thông báo qua email, SMS
- **Tích hợp:** EmailJS/SendGrid, Twilio
- **Endpoints:**
  - `POST /notifications/email`
  - `POST /notifications/sms`

## 3. API Gateway
- **Tech:** Node.js/Express + JWT middleware
- **Chức năng:**
  - Xác thực và phân quyền (RBAC)
  - Điều phối đến các microservice
- **Middleware:**
  - Kiểm tra role (admin, user)
  - Kiểm tra `role_in_club` nếu có


## shared/
- **utils/**: Hàm tiện ích dùng chung (auth, validate, config)
- **constants/**: Hằng số (roles, status, ...)

## docker-compose.yml
- Định nghĩa các service, network, volume cho phát triển đồng bộ
- Ví dụ: frontend, api-gateway, các service, MongoDB/PostgreSQL, Redis

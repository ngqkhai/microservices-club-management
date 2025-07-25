# 📋 Tài liệu API Hệ thống Tuyển dụng

## Tổng quan

Tài liệu này cung cấp tài liệu API toàn diện cho tất cả các chức năng liên quan đến tuyển dụng trong Hệ thống Quản lý Câu lạc bộ. Các API được tổ chức theo vai trò người dùng và chức năng kinh doanh cốt lõi.

## 🔐 Xác thực & Phân quyền

Tất cả các điểm cuối được bảo vệ yêu cầu xác thực JWT thông qua API Gateway. Các header được API Gateway chèn vào:
- `x-user-id`: ID Người dùng
- `x-user-email`: Email người dùng
- `x-user-role`: Vai trò hệ thống (USER, ADMIN)

### Vai trò người dùng

#### Vai trò cấp hệ thống
- **USER**: Người dùng đã xác thực thông thường
- **ADMIN**: Quản trị viên hệ thống

#### Vai trò cấp Câu lạc bộ
- **member**: Thành viên cơ bản của câu lạc bộ
- **organizer**: Người tổ chức (có thể giúp quản lý sự kiện)
- **club_manager**: Quản lý câu lạc bộ (toàn quyền đối với các hoạt động của câu lạc bộ)

---

## 🎯 Các điểm cuối API theo vai trò người dùng

### 1️⃣ Người dùng công khai/Khách (Không yêu cầu xác thực)

#### Duyệt các chiến dịch tuyển dụng đã công bố

<details>
<summary><strong>GET /api/campaigns/published</strong> - Lấy tất cả các chiến dịch tuyển dụng đã công bố</summary>

**Mô tả**: Truy xuất tất cả các chiến dịch tuyển dụng hiện đã được công bố trên tất cả các câu lạc bộ.

**Yêu cầu**:
```http
GET /api/campaigns/published?page=1&limit=10&club_id=12345
Authorization: Không yêu cầu
```

**Tham số truy vấn**:
| Tham số | Kiểu | Bắt buộc | Mô tả |
|-----------|------|----------|-------------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số mục mỗi trang (mặc định: 10, tối đa: 50) |
| club_id | string | Không | Lọc theo ID câu lạc bộ cụ thể |

**Phản hồi** (200 OK):
```json
{
  "success": true,
  "message": "Các chiến dịch đã công bố được truy xuất thành công",
  "data": [
    {
      "id": "60d0fe4f5311236168a109cd",
      "club_id": "60d0fe4f5311236168a109ca",
      "title": "Tuyển dụng mùa thu 2025 - Câu lạc bộ Công nghệ",
      "description": "Tham gia câu lạc bộ công nghệ của chúng tôi để tham gia các buổi hội thảo lập trình và hackathon thú vị",
      "requirements": [
        "Kiến thức lập trình cơ bản",
        "Đam mê công nghệ"
      ],
      "application_questions": [
        {
          "id": "q1",
          "question": "Bạn quen thuộc với những ngôn ngữ lập trình nào?",
          "type": "textarea",
          "required": true,
          "max_length": 500
        },
        {
          "id": "q2", 
          "question": "Tại sao bạn muốn tham gia câu lạc bộ của chúng tôi?",
          "type": "textarea",
          "required": true,
          "max_length": 300
        }
      ],
      "start_date": "2025-09-01T00:00:00Z",
      "end_date": "2025-09-15T23:59:59Z",
      "max_applications": 50,
      "status": "published",
      "statistics": {
        "total_applications": 15,
        "approved_applications": 0,
        "rejected_applications": 0,
        "pending_applications": 15,
        "last_updated": "2025-07-18T10:30:00Z"
      },
      "created_at": "2025-07-15T08:00:00Z",
      "updated_at": "2025-07-18T10:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_items": 25,
    "has_next": true,
    "has_prev": false
  }
}
```

**Các phản hồi lỗi**:
```json
// 400 Bad Request
{
  "success": false,
  "message": "Tham số truy vấn không hợp lệ"
}

// 500 Internal Server Error
{
  "success": false,
  "message": "Lỗi máy chủ nội bộ"
}
```
</details>

<details>
<summary><strong>GET /api/campaigns/clubs/{clubId}/published</strong> - Lấy các chiến dịch đã công bố cho câu lạc bộ cụ thể</summary>

**Mô tả**: Truy xuất tất cả các chiến dịch tuyển dụng đã công bố cho một câu lạc bộ cụ thể.

**Yêu cầu**:
```http
GET /api/campaigns/clubs/60d0fe4f5311236168a109ca/published
Authorization: Không yêu cầu
```

**Tham số đường dẫn**:
| Tham số | Kiểu | Bắt buộc | Mô tả |
|-----------|------|----------|-------------|
| clubId | string | Có | MongoDB ObjectID của câu lạc bộ |

**Phản hồi**: Định dạng tương tự như GET /api/campaigns/published nhưng được lọc theo câu lạc bộ.
</details>

<details>
<summary><strong>GET /api/campaigns/{campaignId}</strong> - Lấy chi tiết chiến dịch cụ thể</summary>

**Mô tả**: Lấy thông tin chi tiết về một chiến dịch tuyển dụng đã công bố cụ thể.

**Yêu cầu**:
```http
GET /api/campaigns/60d0fe4f5311236168a109cd
Authorization: Không yêu cầu
```

**Tham số đường dẫn**:
| Tham số | Kiểu | Bắt buộc | Mô tả |
|-----------|------|----------|-------------|
| campaignId | string | Có | MongoDB ObjectID của chiến dịch |

**Phản hồi** (200 OK):
```json
{
  "success": true,
  "message": "Chi tiết chiến dịch được truy xuất thành công",
  "data": {
    "id": "60d0fe4f5311236168a109cd",
    "club_id": "60d0fe4f5311236168a109ca",
    "title": "Tuyển dụng mùa thu 2025 - Câu lạc bộ Công nghệ",
    "description": "Tham gia câu lạc bộ công nghệ của chúng tôi để tham gia các buổi hội thảo lập trình và hackathon thú vị",
    "requirements": [
      "Kiến thức lập trình cơ bản",
      "Đam mê công nghệ"
    ],
    "application_questions": [
      {
        "id": "q1",
        "question": "Bạn quen thuộc với những ngôn ngữ lập trình nào?",
        "type": "textarea",
        "required": true,
        "max_length": 500
      }
    ],
    "start_date": "2025-09-01T00:00:00Z",
    "end_date": "2025-09-15T23:59:59Z",
    "max_applications": 50,
    "status": "published",
    "statistics": {
      "total_applications": 15,
      "approved_applications": 0,
      "rejected_applications": 0,
      "pending_applications": 15
    },
    "created_at": "2025-07-15T08:00:00Z",
    "updated_at": "2025-07-18T10:30:00Z"
  }
}
```

**Các phản hồi lỗi**:
```json
// 404 Not Found
{
  "success": false,
  "message": "Không tìm thấy chiến dịch hoặc chiến dịch chưa được công bố"
}

// 400 Bad Request
{
  "success": false,
  "message": "Định dạng ID chiến dịch không hợp lệ"
}
```
</details>

#### Các tuyến đường tuyển dụng câu lạc bộ cũ

<details>
<summary><strong>GET /api/clubs/{clubId}/recruitments</strong> - Lấy các đợt tuyển dụng của câu lạc bộ (Cũ)</summary>

**Mô tả**: Điểm cuối cũ để tương thích ngược. Trả về thông tin tuyển dụng cơ bản.

**Yêu cầu**:
```http
GET /api/clubs/60d0fe4f5311236168a109ca/recruitments
Authorization: Không yêu cầu
```

**Phản hồi** (200 OK):
```json
[
  {
    "id": "60d0fe4f5311236168a109cd",
    "title": "Tuyển dụng mùa thu 2025",
    "start_at": "2025-09-01T00:00:00Z",
    "status": "OPEN"
  },
  {
    "id": "60d0fe4f5311236168a109ce", 
    "title": "Tuyển dụng mùa xuân 2025",
    "start_at": "2025-03-01T00:00:00Z",
    "status": "CLOSED"
  }
]
```
</details>

---

### 2️⃣ Người dùng đã xác thực (Vai trò USER)

#### Gửi và quản lý đơn ứng tuyển

<details>
<summary><strong>POST /api/campaigns/{campaignId}/apply</strong> - Gửi đơn ứng tuyển</summary>

**Mô tả**: Gửi đơn ứng tuyển vào một chiến dịch tuyển dụng đã công bố.

**Yêu cầu**:
```http
POST /api/campaigns/60d0fe4f5311236168a109cd/apply
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Nội dung yêu cầu**:
```json
{
  "application_message": "Tôi đam mê công nghệ và rất muốn đóng góp vào các hoạt động của câu lạc bộ.",
  "application_answers": {
    "q1": "Tôi quen thuộc với JavaScript, Python và React. Tôi đã xây dựng một số ứng dụng web và đóng góp cho các dự án mã nguồn mở.",
    "q2": "Tôi muốn tham gia câu lạc bộ công nghệ để học hỏi các công nghệ mới, hợp tác trong các dự án và kết nối với những người cùng chí hướng."
  }
}
```

**Tham số nội dung**:
| Tham số | Kiểu | Bắt buộc | Mô tả |
|-----------|------|----------|-------------|
| application_message | string | Không | Tin nhắn ứng tuyển chung (tối đa 1000 ký tự) |
| application_answers | object | Không | Câu trả lời cho các câu hỏi cụ thể của chiến dịch |

**Phản hồi** (201 Created):
```json
{
  "success": true,
  "message": "Đơn ứng tuyển đã được gửi thành công",
  "data": {
    "id": "60d0fe4f5311236168a109cf",
    "campaign_id": "60d0fe4f5311236168a109cd",
    "user_id": "auth-user-123",
    "user_email": "john.doe@example.com",
    "status": "pending",
    "application_message": "Tôi đam mê công nghệ...",
    "application_answers": {
      "q1": "Tôi quen thuộc với JavaScript, Python và React...",
      "q2": "Tôi muốn tham gia câu lạc bộ công nghệ để học hỏi các công nghệ mới..."
    },
    "submitted_at": "2025-07-18T14:30:00Z"
  }
}
```

**Các phản hồi lỗi**:
```json
// 404 Not Found
{
  "success": false,
  "message": "Không tìm thấy chiến dịch hoặc chiến dịch không nhận đơn ứng tuyển"
}

// 409 Conflict
{
  "success": false,
  "message": "Bạn đã ứng tuyển vào chiến dịch này rồi"
}

// 400 Bad Request
{
  "success": false,
  "message": "Thời gian ứng tuyển của chiến dịch đã kết thúc"
}

// 401 Unauthorized
{
  "success": false,
  "message": "Yêu cầu xác thực"
}
```
</details>

<details>
<summary><strong>GET /api/campaigns/{campaignId}/applications/{applicationId}</strong> - Lấy trạng thái đơn ứng tuyển</summary>

**Mô tả**: Lấy chi tiết và trạng thái của một đơn ứng tuyển cụ thể. Người dùng chỉ có thể xem đơn của chính mình.

**Yêu cầu**:
```http
GET /api/campaigns/60d0fe4f5311236168a109cd/applications/60d0fe4f5311236168a109cf
Authorization: Bearer {jwt_token}
```

**Phản hồi** (200 OK):
```json
{
  "success": true,
  "message": "Đơn ứng tuyển được truy xuất thành công",
  "data": {
    "id": "60d0fe4f5311236168a109cf",
    "campaign_id": "60d0fe4f5311236168a109cd",
    "campaign_title": "Tuyển dụng mùa thu 2025 - Câu lạc bộ Công nghệ",
    "club_name": "Câu lạc bộ Công nghệ",
    "status": "pending",
    "application_message": "Tôi đam mê công nghệ...",
    "application_answers": {
      "q1": "Tôi quen thuộc với JavaScript, Python và React...",
      "q2": "Tôi muốn tham gia câu lạc bộ công nghệ để học hỏi các công nghệ mới..."
    },
    "submitted_at": "2025-07-18T14:30:00Z",
    "updated_at": "2025-07-18T14:30:00Z",
    "feedback": null
  }
}
```

**Các phản hồi lỗi**:
```json
// 404 Not Found
{
  "success": false,
  "message": "Không tìm thấy đơn ứng tuyển"
}

// 403 Forbidden
{
  "success": false,
  "message": "Bạn chỉ có thể xem đơn ứng tuyển của chính mình"
}
```
</details>

<details>
<summary><strong>PUT /api/campaigns/{campaignId}/applications/{applicationId}</strong> - Cập nhật đơn ứng tuyển</summary>

**Mô tả**: Cập nhật một đơn ứng tuyển đang chờ xử lý. Chỉ được phép nếu chiến dịch cho phép chỉnh sửa và đơn vẫn đang chờ xử lý.

**Yêu cầu**:
```http
PUT /api/campaigns/60d0fe4f5311236168a109cd/applications/60d0fe4f5311236168a109cf
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Nội dung yêu cầu**:
```json
{
  "application_message": "Cập nhật: Tôi đam mê công nghệ và có kinh nghiệm gần đây với AI...",
  "application_answers": {
    "q1": "Cập nhật: Tôi quen thuộc với JavaScript, Python, React và gần đây đã học máy học với TensorFlow...",
    "q2": "Tôi muốn tham gia câu lạc bộ công nghệ để học hỏi các công nghệ mới, hợp tác trong các dự án AI và đóng góp cho cộng đồng."
  }
}
```

**Phản hồi** (200 OK):
```json
{
  "success": true,
  "message": "Đơn ứng tuyển được cập nhật thành công",
  "data": {
    "id": "60d0fe4f5311236168a109cf",
    "campaign_id": "60d0fe4f5311236168a109cd",
    "status": "pending",
    "application_message": "Cập nhật: Tôi đam mê công nghệ và có kinh nghiệm gần đây với AI...",
    "application_answers": {
      "q1": "Cập nhật: Tôi quen thuộc với JavaScript, Python, React và gần đây đã học máy học...",
      "q2": "Tôi muốn tham gia câu lạc bộ công nghệ để học hỏi các công nghệ mới, hợp tác trong các dự án AI..."
    },
    "submitted_at": "2025-07-18T14:30:00Z",
    "updated_at": "2025-07-18T16:45:00Z"
  }
}
```

**Các phản hồi lỗi**:
```json
// 400 Bad Request
{
  "success": false,
  "message": "Không được phép chỉnh sửa đơn ứng tuyển cho chiến dịch này"
}

// 400 Bad Request
{
  "success": false,
  "message": "Không thể chỉnh sửa đơn ứng tuyển đã được xem xét"
}
```
</details>

<details>
<summary><strong>DELETE /api/campaigns/{campaignId}/applications/{applicationId}</strong> - Rút đơn ứng tuyển</summary>

**Mô tả**: Rút/hủy một đơn ứng tuyển. Chỉ có thể rút các đơn đang chờ xử lý.

**Yêu cầu**:
```http
DELETE /api/campaigns/60d0fe4f5311236168a109cd/applications/60d0fe4f5311236168a109cf
Authorization: Bearer {jwt_token}
```

**Phản hồi** (200 OK):
```json
{
  "success": true,
  "message": "Đơn ứng tuyển đã được rút thành công"
}
```

**Các phản hồi lỗi**:
```json
// 400 Bad Request
{
  "success": false,
  "message": "Không thể rút đơn ứng tuyển đã được xử lý"
}

// 404 Not Found
{
  "success": false,
  "message": "Không tìm thấy đơn ứng tuyển"
}
```
</details>

#### Xem các đơn ứng tuyển của người dùng

<details>
<summary><strong>GET /api/users/{userId}/applications</strong> - Lấy tất cả các đơn ứng tuyển của người dùng</summary>

**Mô tả**: Lấy tất cả các đơn ứng tuyển do người dùng đã xác thực gửi.

**Yêu cầu**:
```http
GET /api/users/auth-user-123/applications?page=1&limit=10&status=pending
Authorization: Bearer {jwt_token}
```

**Tham số truy vấn**:
| Tham số | Kiểu | Bắt buộc | Mô tả |
|-----------|------|----------|-------------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số mục mỗi trang (mặc định: 10) |
| status | string | Không | Lọc theo trạng thái (pending, approved, rejected) |

**Phản hồi** (200 OK):
```json
{
  "success": true,
  "message": "Các đơn ứng tuyển của người dùng được truy xuất thành công",
  "data": {
    "applications": [
      {
        "id": "60d0fe4f5311236168a109cf",
        "campaign_id": "60d0fe4f5311236168a109cd",
        "campaign_title": "Tuyển dụng mùa thu 2025 - Câu lạc bộ Công nghệ",
        "club_name": "Câu lạc bộ Công nghệ",
        "club_id": "60d0fe4f5311236168a109ca",
        "status": "pending",
        "submitted_at": "2025-07-18T14:30:00Z",
        "updated_at": "2025-07-18T16:45:00Z"
      },
      {
        "id": "60d0fe4f5311236168a109d0",
        "campaign_id": "60d0fe4f5311236168a109ce",
        "campaign_title": "Tuyển dụng mùa xuân 2025 - Câu lạc bộ Nghệ thuật",
        "club_name": "Câu lạc bộ Nghệ thuật",
        "club_id": "60d0fe4f5311236168a109cb",
        "status": "approved",
        "submitted_at": "2025-03-10T10:15:00Z",
        "updated_at": "2025-03-15T14:20:00Z",
        "feedback": "Portfolio tuyệt vời! Chào mừng bạn đến với Câu lạc bộ Nghệ thuật."
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 2,
      "has_next": false,
      "has_prev": false
    }
  }
}
```

**Các phản hồi lỗi**:
```json
// 403 Forbidden
{
  "success": false,
  "message": "Bạn chỉ có thể xem đơn ứng tuyển của chính mình"
}
```
</details>

---

### 3️⃣ Quản lý câu lạc bộ (vai trò club_manager)

#### Quản lý chiến dịch

<details>
<summary><strong>POST /api/clubs/{clubId}/campaigns</strong> - Tạo chiến dịch tuyển dụng</summary>

**Mô tả**: Tạo một chiến dịch tuyển dụng mới cho câu lạc bộ. Chỉ quản lý câu lạc bộ mới có thể tạo chiến dịch.

**Yêu cầu**:
```http
POST /api/clubs/60d0fe4f5311236168a109ca/campaigns
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Nội dung yêu cầu**:
```json
{
  "title": "Tuyển dụng mùa thu 2025 - Câu lạc bộ Công nghệ",
  "description": "Tham gia câu lạc bộ công nghệ của chúng tôi để tham gia các buổi hội thảo lập trình, hackathon và cơ hội kết nối với các chuyên gia trong ngành.",
  "requirements": [
    "Kiến thức lập trình cơ bản ở bất kỳ ngôn ngữ nào",
    "Đam mê công nghệ và đổi mới",
    "Cam kết tham dự các cuộc họp thường xuyên"
  ],
  "application_questions": [
    {
      "id": "q1",
      "question": "Bạn quen thuộc với những ngôn ngữ lập trình nào?",
      "type": "textarea",
      "required": true,
      "max_length": 500
    },
    {
      "id": "q2",
      "question": "Mô tả một dự án bạn đã làm mà bạn tự hào",
      "type": "textarea",
      "required": false,
      "max_length": 800
    },
    {
      "id": "q3",
      "question": "Bạn quan tâm nhất đến lĩnh vực công nghệ nào?",
      "type": "select",
      "required": true,
      "options": ["Phát triển web", "Phát triển di động", "AI/ML", "Khoa học dữ liệu", "An ninh mạng", "Khác"]
    }
  ],
  "start_date": "2025-09-01T00:00:00Z",
  "end_date": "2025-09-15T23:59:59Z",
  "max_applications": 50,
  "status": "draft"
}
```

**Tham số nội dung**:
| Tham số | Kiểu | Bắt buộc | Mô tả |
|-----------|------|----------|-------------|
| title | string | Có | Tiêu đề chiến dịch (tối đa 200 ký tự) |
| description | string | Có | Mô tả chiến dịch (tối đa 2000 ký tự) |
| requirements | array | Không | Danh sách các yêu cầu (mỗi yêu cầu tối đa 250 ký tự) |
| application_questions | array | Không | Các câu hỏi ứng tuyển tùy chỉnh |
| start_date | string (ISO) | Có | Ngày bắt đầu chiến dịch |
| end_date | string (ISO) | Có | Ngày kết thúc chiến dịch |
| max_applications | number | Không | Số lượng đơn ứng tuyển tối đa |
| status | string | Không | Trạng thái ban đầu (mặc định: "draft") |

**Phản hồi** (201 Created):
```json
{
  "success": true,
  "message": "Chiến dịch được tạo thành công",
  "data": {
    "id": "60d0fe4f5311236168a109cd",
    "club_id": "60d0fe4f5311236168a109ca",
    "title": "Tuyển dụng mùa thu 2025 - Câu lạc bộ Công nghệ",
    "description": "Tham gia câu lạc bộ công nghệ của chúng tôi để tham gia các buổi hội thảo lập trình...",
    "requirements": [
      "Kiến thức lập trình cơ bản ở bất kỳ ngôn ngữ nào",
      "Đam mê công nghệ và đổi mới",
      "Cam kết tham dự các cuộc họp thường xuyên"
    ],
    "application_questions": [
      {
        "id": "q1",
        "question": "Bạn quen thuộc với những ngôn ngữ lập trình nào?",
        "type": "textarea",
        "required": true,
        "max_length": 500
      }
    ],
    "start_date": "2025-09-01T00:00:00Z",
    "end_date": "2025-09-15T23:59:59Z",
    "max_applications": 50,
    "status": "draft",
    "statistics": {
      "total_applications": 0,
      "approved_applications": 0,
      "rejected_applications": 0,
      "pending_applications": 0,
      "last_updated": "2025-07-18T10:30:00Z"
    },
    "created_by": "auth-user-123",
    "created_at": "2025-07-18T10:30:00Z",
    "updated_at": "2025-07-18T10:30:00Z"
  }
}
```

**Các phản hồi lỗi**:
```json
// 403 Forbidden
{
  "success": false,
  "message": "Quyền không đủ. Chỉ quản lý câu lạc bộ mới có thể tạo chiến dịch"
}

// 400 Bad Request
{
  "success": false,
  "message": "Xác thực không thành công",
  "errors": [
    "Ngày kết thúc phải sau ngày bắt đầu",
    "Tiêu đề là bắt buộc"
  ]
}
```
</details>

<details>
<summary><strong>GET /api/clubs/{clubId}/campaigns</strong> - Lấy các chiến dịch của câu lạc bộ với bộ lọc trạng thái</summary>

**Mô tả**: Lấy các chiến dịch của câu lạc bộ với khả năng lọc theo trạng thái. Chỉ quản lý câu lạc bộ mới có thể truy cập.

**Yêu cầu**:
```http
GET /api/clubs/60d0fe4f5311236168a109ca/campaigns?status=draft,published&page=1&limit=10
Authorization: Bearer {jwt_token}
```

**Tham số truy vấn**:
| Tham số | Kiểu | Bắt buộc | Mô tả |
|-----------|------|----------|-------------|
| status | string | Không | Danh sách trạng thái được phân tách bằng dấu phẩy để lọc (draft,published,completed,paused). Mặc định: 'draft' |
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số mục mỗi trang (mặc định: 10) |
| sort | string | Không | Trường sắp xếp |

**Các trạng thái hợp lệ**:
- `draft` - Chiến dịch ở trạng thái nháp
- `published` - Chiến dịch đã được công bố/đang hoạt động
- `completed` - Chiến dịch đã hoàn thành
- `paused` - Chiến dịch tạm dừng

**Ví dụ sử dụng**:
```http
# Lấy tất cả chiến dịch nháp (hành vi mặc định)
GET /api/clubs/123/campaigns

# Chỉ lấy chiến dịch đã công bố
GET /api/clubs/123/campaigns?status=published

# Lấy nhiều trạng thái chiến dịch
GET /api/clubs/123/campaigns?status=draft,published,completed

# Lấy tất cả chiến dịch với phân trang
GET /api/clubs/123/campaigns?status=draft,published,completed,paused&page=1&limit=10
```

**Phản hồi** (200 OK):
```json
{
  "success": true,
  "message": "Các chiến dịch được truy xuất thành công",
  "data": {
    "campaigns": [
      {
        "id": "60d0fe4f5311236168a109cd",
        "club_id": "60d0fe4f5311236168a109ca",
        "title": "Tuyển dụng mùa thu 2025 - Câu lạc bộ Công nghệ",
        "description": "Tham gia câu lạc bộ công nghệ của chúng tôi để tham gia các buổi hội thảo lập trình...",
        "status": "published",
        "start_date": "2025-09-01T00:00:00Z",
        "end_date": "2025-09-15T23:59:59Z",
        "max_applications": 50,
        "statistics": {
          "total_applications": 15,
          "pending_applications": 12,
          "approved_applications": 2,
          "rejected_applications": 1
        },
        "created_at": "2025-07-18T10:30:00Z",
        "updated_at": "2025-07-18T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_items": 15,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

**Các phản hồi lỗi**:
```json
// 400 Bad Request - Trạng thái không hợp lệ
{
  "success": false,
  "message": "Giá trị trạng thái không hợp lệ: invalid_status. Các trạng thái hợp lệ là: draft, published, completed, paused"
}

// 401 Unauthorized
{
  "success": false,
  "message": "Yêu cầu xác thực"
}

// 403 Forbidden
{
  "success": false,
  "message": "Quyền không đủ. Chỉ quản lý câu lạc bộ mới có thể truy cập"
}
```
</details>

<details>
<summary><strong>GET /api/clubs/{clubId}/campaigns/{campaignId}</strong> - Lấy chi tiết chiến dịch cụ thể</summary>

**Mô tả**: Lấy thông tin chi tiết về một chiến dịch cụ thể. Quản lý câu lạc bộ có thể xem các chiến dịch nháp.

**Yêu cầu**:
```http
GET /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd
Authorization: Bearer {jwt_token}
```

**Phản hồi**: Định dạng tương tự như phản hồi tạo chiến dịch với đầy đủ chi tiết chiến dịch.
</details>

<details>
<summary><strong>PUT /api/clubs/{clubId}/campaigns/{campaignId}</strong> - Cập nhật chiến dịch</summary>

**Mô tả**: Cập nhật một chiến dịch hiện có. Chỉ các chiến dịch nháp mới có thể được chỉnh sửa hoàn toàn.

**Yêu cầu**:
```http
PUT /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Nội dung yêu cầu**: Định dạng tương tự như tạo chiến dịch, nhưng tất cả các trường đều là tùy chọn.

**Phản hồi**: Định dạng tương tự như phản hồi tạo chiến dịch với dữ liệu đã được cập nhật.

**Các phản hồi lỗi**:
```json
// 400 Bad Request
{
  "success": false,
  "message": "Không thể chỉnh sửa chiến dịch đã công bố. Chỉ có thể sửa đổi mô tả và ngày kết thúc."
}
```
</details>

<details>
<summary><strong>DELETE /api/clubs/{clubId}/campaigns/{campaignId}</strong> - Xóa chiến dịch</summary>

**Mô tả**: Xóa một chiến dịch. Chỉ các chiến dịch nháp mới có thể bị xóa.

**Yêu cầu**:
```http
DELETE /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd
Authorization: Bearer {jwt_token}
```

**Phản hồi** (200 OK):
```json
{
  "success": true,
  "message": "Chiến dịch đã được xóa thành công"
}
```

**Các phản hồi lỗi**:
```json
// 400 Bad Request
{
  "success": false,
  "message": "Không thể xóa chiến dịch đã công bố có đơn ứng tuyển hiện có"
}
```
</details>

#### Quản lý trạng thái chiến dịch

<details>
<summary><strong>POST /api/clubs/{clubId}/campaigns/{campaignId}/publish</strong> - Công bố chiến dịch</summary>

**Mô tả**: Thay đổi trạng thái chiến dịch từ nháp sang đã công bố, làm cho nó hiển thị với người dùng.

**Yêu cầu**:
```http
POST /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/publish
Authorization: Bearer {jwt_token}
```

**Phản hồi** (200 OK):
```json
{
  "success": true,
  "message": "Chiến dịch được công bố thành công",
  "data": {
    "id": "60d0fe4f5311236168a109cd",
    "club_id": "60d0fe4f5311236168a109ca",
    "title": "Tuyển dụng mùa thu 2025 - Câu lạc bộ Công nghệ",
    "status": "published",
    "published_at": "2025-07-18T11:00:00Z",
    "updated_at": "2025-07-18T11:00:00Z"
  }
}
```
</details>

<details>
<summary><strong>POST /api/clubs/{clubId}/campaigns/{campaignId}/pause</strong> - Tạm dừng chiến dịch</summary>

**Mô tả**: Tạm thời dừng một chiến dịch đã công bố để ngừng nhận đơn ứng tuyển mới.

**Yêu cầu**:
```http
POST /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/pause
Authorization: Bearer {jwt_token}
```

**Phản hồi**: Tương tự như phản hồi công bố với trạng thái "paused".
</details>

<details>
<summary><strong>POST /api/clubs/{clubId}/campaigns/{campaignId}/resume</strong> - Tiếp tục chiến dịch</summary>

**Mô tả**: Tiếp tục một chiến dịch đã tạm dừng để tiếp tục nhận đơn ứng tuyển.

**Yêu cầu**:
```http
POST /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/resume
Authorization: Bearer {jwt_token}
```

**Phản hồi**: Tương tự như phản hồi công bố với trạng thái "published".
</details>

<details>
<summary><strong>POST /api/clubs/{clubId}/campaigns/{campaignId}/complete</strong> - Hoàn thành chiến dịch</summary>

**Mô tả**: Đánh dấu chiến dịch là đã hoàn thành, ngừng tất cả các đơn ứng tuyển và hoàn tất việc tuyển dụng.

**Yêu cầu**:
```http
POST /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/complete
Authorization: Bearer {jwt_token}
```

**Phản hồi**: Tương tự như phản hồi công bố với trạng thái "completed".
</details>

#### Xem xét & Quản lý đơn ứng tuyển

<details>
<summary><strong>GET /api/clubs/{clubId}/campaigns/{campaignId}/applications</strong> - Lấy đơn ứng tuyển của chiến dịch</summary>

**Mô tả**: Lấy tất cả các đơn ứng tuyển cho một chiến dịch cụ thể. Chỉ quản lý câu lạc bộ mới có thể truy cập.

**Yêu cầu**:
```http
GET /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/applications?page=1&limit=10&status=pending
Authorization: Bearer {jwt_token}
```

**Tham số truy vấn**:
| Tham số | Kiểu | Bắt buộc | Mô tả |
|-----------|------|----------|-------------|
| page | number | Không | Số trang (mặc định: 1) |
| limit | number | Không | Số mục mỗi trang (mặc định: 10) |
| status | string | Không | Lọc theo trạng thái (pending, approved, rejected) |

**Phản hồi** (200 OK):
```json
{
  "success": true,
  "message": "Các đơn ứng tuyển được truy xuất thành công",
  "data": {
    "applications": [
      {
        "id": "60d0fe4f5311236168a109cf",
        "user_id": "auth-user-123",
        "user_email": "john.doe@example.com",
        "status": "pending",
        "application_message": "Tôi đam mê công nghệ...",
        "application_answers": {
          "q1": "Tôi quen thuộc với JavaScript, Python và React...",
          "q2": "Tôi muốn tham gia câu lạc bộ công nghệ để học hỏi các công nghệ mới..."
        },
        "submitted_at": "2025-07-18T14:30:00Z",
        "updated_at": "2025-07-18T16:45:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_items": 15,
      "has_next": true,
      "has_prev": false
    },
    "summary": {
      "total_applications": 15,
      "pending_applications": 12,
      "approved_applications": 2,
      "rejected_applications": 1
    }
  }
}
```
</details>

<details>
<summary><strong>GET /api/clubs/{clubId}/campaigns/{campaignId}/applications/{applicationId}</strong> - Lấy chi tiết đơn ứng tuyển</summary>

**Mô tả**: Lấy thông tin chi tiết về một đơn ứng tuyển cụ thể.

**Yêu cầu**:
```http
GET /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/applications/60d0fe4f5311236168a109cf
Authorization: Bearer {jwt_token}
```

**Phản hồi** (200 OK):
```json
{
  "success": true,
  "message": "Chi tiết đơn ứng tuyển được truy xuất thành công",
  "data": {
    "id": "60d0fe4f5311236168a109cf",
    "campaign_id": "60d0fe4f5311236168a109cd",
    "user_id": "auth-user-123",
    "user_email": "john.doe@example.com",
    "user_profile": {
      "full_name": "John Doe",
      "email": "john.doe@example.com"
    },
    "status": "pending",
    "application_message": "Tôi đam mê công nghệ và rất muốn đóng góp vào các hoạt động của câu lạc bộ.",
    "application_answers": {
      "q1": "Tôi quen thuộc với JavaScript, Python và React. Tôi đã xây dựng một số ứng dụng web và đóng góp cho các dự án mã nguồn mở.",
      "q2": "Tôi muốn tham gia câu lạc bộ công nghệ để học hỏi các công nghệ mới, hợp tác trong các dự án và kết nối với những người cùng chí hướng.",
      "q3": "Phát triển web"
    },
    "submitted_at": "2025-07-18T14:30:00Z",
    "updated_at": "2025-07-18T16:45:00Z",
    "review_notes": null,
    "reviewed_by": null,
    "reviewed_at": null
  }
}
```
</details>

<details>
<summary><strong>PUT /api/clubs/{clubId}/campaigns/{campaignId}/applications/{applicationId}/status</strong> - Cập nhật trạng thái đơn ứng tuyển</summary>

**Mô tả**: Cập nhật trạng thái của một đơn ứng tuyển với ghi chú xem xét tùy chọn.

**Yêu cầu**:
```http
PUT /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/applications/60d0fe4f5311236168a109cf/status
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Nội dung yêu cầu**:
```json
{
  "status": "approved",
  "notes": "Nền tảng kỹ thuật và sự nhiệt tình xuất sắc. Chào mừng bạn đến với đội!"
}
```

**Tham số nội dung**:
| Tham số | Kiểu | Bắt buộc | Mô tả |
|-----------|------|----------|-------------|
| status | string | Có | Trạng thái mới (approved, rejected, pending) |
| notes | string | Không | Ghi chú xem xét (tối đa 1000 ký tự) |

**Phản hồi** (200 OK):
```json
{
  "success": true,
  "message": "Đơn ứng tuyển được chấp thuận thành công",
  "data": {
    "id": "60d0fe4f5311236168a109cf",
    "status": "approved",
    "review_notes": "Nền tảng kỹ thuật và sự nhiệt tình xuất sắc. Chào mừng bạn đến với đội!",
    "reviewed_by": "club-manager-456",
    "reviewed_at": "2025-07-18T17:00:00Z",
    "updated_at": "2025-07-18T17:00:00Z"
  }
}
```
</details>

<details>
<summary><strong>POST /api/clubs/{clubId}/campaigns/{campaignId}/applications/{applicationId}/approve</strong> - Chấp thuận và thêm vào câu lạc bộ</summary>

**Mô tả**: Chấp thuận một đơn ứng tuyển và tự động thêm người dùng vào câu lạc bộ với vai trò được chỉ định.

**Yêu cầu**:
```http
POST /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/applications/60d0fe4f5311236168a109cf/approve
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Nội dung yêu cầu**:
```json
{
  "role": "member",
  "notes": "Chào mừng bạn đến với Câu lạc bộ Công nghệ! Mong chờ những đóng góp của bạn."
}
```

**Tham số nội dung**:
| Tham số | Kiểu | Bắt buộc | Mô tả |
|-----------|------|----------|-------------|
| role | string | Không | Vai trò trong câu lạc bộ (mặc định: "member") |
| notes | string | Không | Tin nhắn chào mừng/ghi chú |

**Phản hồi** (200 OK):
```json
{
  "success": true,
  "message": "Đơn ứng tuyển được chấp thuận và người dùng được thêm vào câu lạc bộ thành công",
  "data": {
    "application": {
      "id": "60d0fe4f5311236168a109cf",
      "status": "approved",
      "review_notes": "Chào mừng bạn đến với Câu lạc bộ Công nghệ! Mong chờ những đóng góp của bạn.",
      "reviewed_by": "club-manager-456",
      "reviewed_at": "2025-07-18T17:00:00Z"
    },
    "membership": {
      "id": "60d0fe4f5311236168a109d1",
      "club_id": "60d0fe4f5311236168a109ca",
      "user_id": "auth-user-123",
      "role": "member",
      "status": "active",
      "joined_at": "2025-07-18T17:00:00Z"
    }
  }
}
```
</details>

<details>
<summary><strong>POST /api/clubs/{clubId}/campaigns/{campaignId}/applications/{applicationId}/reject</strong> - Từ chối đơn ứng tuyển</summary>

**Mô tả**: Từ chối một đơn ứng tuyển với lý do và phản hồi tùy chọn.

**Yêu cầu**:
```http
POST /api/clubs/60d0fe4f5311236168a109ca/campaigns/60d0fe4f5311236168a109cd/applications/60d0fe4f5311236168a109cf/reject
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Nội dung yêu cầu**:
```json
{
  "reason": "insufficient_experience",
  "notes": "Cảm ơn bạn đã quan tâm. Chúng tôi khuyến khích bạn tích lũy thêm kinh nghiệm và ứng tuyển lại vào học kỳ tới."
}
```

**Tham số nội dung**:
| Tham số | Kiểu | Bắt buộc | Mô tả |
|-----------|------|----------|-------------|
| reason | string | Không | Mã lý do từ chối |
| notes | string | Không | Phản hồi chi tiết (tối đa 1000 ký tự) |

**Phản hồi** (200 OK):
```json
{
  "success": true,
  "message": "Đơn ứng tuyển đã bị từ chối thành công",
  "data": {
    "id": "60d0fe4f5311236168a109cf",
    "status": "rejected",
    "rejection_reason": "insufficient_experience",
    "review_notes": "Cảm ơn bạn đã quan tâm. Chúng tôi khuyến khích bạn tích lũy thêm kinh nghiệm và ứng tuyển lại vào học kỳ tới.",
    "reviewed_by": "club-manager-456",
    "reviewed_at": "2025-07-18T17:00:00Z",
    "updated_at": "2025-07-18T17:00:00Z"
  }
}
```
</details>

#### Các tuyến đường quản lý đơn ứng tuyển đơn giản hóa

<details>
<summary><strong>PUT /api/clubs/{clubId}/applications/{applicationId}/status</strong> - Cập nhật trạng thái đơn ứng tuyển (Đơn giản hóa)</summary>

**Mô tả**: Tuyến đường đơn giản hóa để cập nhật trạng thái đơn ứng tuyển mà không cần ID chiến dịch.

**Yêu cầu**:
```http
PUT /api/clubs/60d0fe4f5311236168a109ca/applications/60d0fe4f5311236168a109cf/status
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Yêu cầu/Phản hồi**: Định dạng tương tự như tuyến đường đầy đủ ở trên.
</details>

<details>
<summary><strong>POST /api/clubs/{clubId}/applications/{applicationId}/approve</strong> - Chấp thuận đơn ứng tuyển (Đơn giản hóa)</summary>

**Mô tả**: Tuyến đường đơn giản hóa để chấp thuận đơn ứng tuyển và thêm người dùng vào câu lạc bộ.

**Yêu cầu**: Định dạng tương tự như tuyến đường đầy đủ.
**Phản hồi**: Định dạng tương tự như tuyến đường đầy đủ.
</details>

<details>
<summary><strong>POST /api/clubs/{clubId}/applications/{applicationId}/reject</strong> - Từ chối đơn ứng tuyển (Đơn giản hóa)</summary>

**Mô tả**: Tuyến đường đơn giản hóa để từ chối đơn ứng tuyển.

**Yêu cầu**: Định dạng tương tự như tuyến đường đầy đủ.
**Phản hồi**: Định dạng tương tự như tuyến đường đầy đủ.
</details>

---

### 4️⃣ Quản trị viên hệ thống (Vai trò ADMIN)

#### Quản lý đơn ứng tuyển người dùng nâng cao

<details>
<summary><strong>GET /api/users/{userId}/applications</strong> - Lấy đơn ứng tuyển của bất kỳ người dùng nào (Chỉ Admin)</summary>

**Mô tả**: Quản trị viên hệ thống có thể xem đơn ứng tuyển của bất kỳ người dùng nào.

**Yêu cầu**:
```http
GET /api/users/any-user-id/applications?page=1&limit=10
Authorization: Bearer {admin_jwt_token}
```

**Phản hồi**: Định dạng tương tự như điểm cuối đơn ứng tuyển của chính người dùng.

**Quyền bổ sung**:
- Có thể xem đơn ứng tuyển của bất kỳ người dùng nào
- Có thể truy cập thống kê đơn ứng tuyển toàn hệ thống
- Có thể ghi đè quyết định của quản lý câu lạc bộ (tùy thuộc vào việc triển khai)
</details>

---

## 🔧 Mô hình dữ liệu

### Đối tượng Campaign
```typescript
interface Campaign {
  id: string;                    // MongoDB ObjectID
  club_id: string;              // Tham chiếu đến câu lạc bộ
  title: string;                // Tiêu đề chiến dịch (tối đa 200 ký tự)
  description: string;          // Mô tả chiến dịch (tối đa 2000 ký tự)
  requirements: string[];       // Danh sách các yêu cầu
  application_questions: ApplicationQuestion[];
  start_date: string;           // Chuỗi ngày ISO 8601
  end_date: string;             // Chuỗi ngày ISO 8601
  max_applications?: number;    // Số lượng đơn ứng tuyển tối đa được phép
  status: 'draft' | 'published' | 'paused' | 'completed';
  statistics: CampaignStatistics;
  created_by: string;           // ID người dùng đã tạo
  created_at: string;           // Chuỗi ngày ISO 8601
  updated_at: string;           // Chuỗi ngày ISO 8601
}
```

### Đối tượng ApplicationQuestion
```typescript
interface ApplicationQuestion {
  id: string;                   // ID câu hỏi duy nhất
  question: string;             // Nội dung câu hỏi (tối đa 500 ký tự)
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  required: boolean;            // Câu trả lời có bắt buộc không
  max_length?: number;          // Độ dài câu trả lời tối đa cho các trường văn bản
  options?: string[];           // Các tùy chọn cho select/checkbox
}
```

### Đối tượng Application
```typescript
interface Application {
  id: string;                   // MongoDB ObjectID
  campaign_id: string;          // Tham chiếu đến chiến dịch
  user_id: string;             // ID người dùng từ dịch vụ xác thực
  user_email: string;          // Email người dùng
  status: 'pending' | 'approved' | 'rejected';
  application_message?: string; // Tin nhắn chung (tối đa 1000 ký tự)
  application_answers: Record<string, string>; // ID câu hỏi -> Câu trả lời
  submitted_at: string;         // Chuỗi ngày ISO 8601
  updated_at: string;          // Chuỗi ngày ISO 8601
  review_notes?: string;        // Ghi chú xem xét của quản lý
  reviewed_by?: string;         // Quản lý đã xem xét
  reviewed_at?: string;         // Thời gian xem xét
  rejection_reason?: string;    // Mã lý do từ chối
}
```

### Đối tượng CampaignStatistics
```typescript
interface CampaignStatistics {
  total_applications: number;
  approved_applications: number;
  rejected_applications: number;
  pending_applications: number;
  last_updated: string;         // Chuỗi ngày ISO 8601
}
```

### Đối tượng Membership
```typescript
interface Membership {
  id: string;                   // MongoDB ObjectID
  club_id: string;             // Tham chiếu đến câu lạc bộ
  user_id: string;             // ID người dùng từ dịch vụ xác thực
  campaign_id?: string;         // Tham chiếu đến chiến dịch tuyển dụng
  role: 'member' | 'organizer' | 'club_manager';
  status: 'active' | 'pending' | 'rejected' | 'removed';
  joined_at: string;           // Chuỗi ngày ISO 8601
  approved_by?: string;         // Ai đã chấp thuận tư cách thành viên
  approved_at?: string;         // Thời gian chấp thuận
}
```

---

## 🔄 Sơ đồ luồng trạng thái

### Luồng trạng thái chiến dịch
```
nháp → đã công bố → tạm dừng ⟷ đã công bố → đã hoàn thành
   ↓
đã xóa (chỉ dành cho nháp)
```

### Luồng trạng thái đơn ứng tuyển
```
                    đã gửi
                        ↓
                    đang chờ xử lý
                   ↙       ↘
              đã chấp thuận    đã từ chối
                 ↓
           đã thêm vào câu lạc bộ
```

---

## 🚨 Xử lý lỗi

### Định dạng phản hồi lỗi tiêu chuẩn
```json
{
  "success": false,
  "message": "Thông báo lỗi dễ đọc cho người dùng",
  "error_code": "MÃ_LỖI",           // Tùy chọn
  "errors": ["Lỗi xác thực 1"],     // Tùy chọn cho các lỗi xác thực
  "details": { }                        // Tùy chọn chi tiết bổ sung
}
```

### Các mã trạng thái HTTP phổ biến

| Trạng thái | Mô tả | Khi sử dụng |
|--------|-------------|-----------|
| 200 | Thành công | Các hoạt động GET, PUT, DELETE thành công |
| 201 | Đã tạo | Các hoạt động POST thành công |
| 400 | Yêu cầu không hợp lệ | Lỗi xác thực, yêu cầu không đúng định dạng |
| 401 | Không được phép | Thiếu hoặc không hợp lệ xác thực |
| 403 | Bị cấm | Quyền không đủ |
| 404 | Không tìm thấy | Không tìm thấy tài nguyên |
| 409 | Xung đột | Tài nguyên đã tồn tại, xung đột trạng thái |
| 429 | Giới hạn tốc độ | Quá nhiều yêu cầu |
| 500 | Lỗi máy chủ | Lỗi máy chủ nội bộ |

---

## 📝 Ghi chú triển khai

### Cân nhắc về bảo mật
1. Tất cả các điểm cuối được bảo vệ yêu cầu mã thông báo JWT hợp lệ
2. Kiểm soát truy cập dựa trên vai trò được thực thi ở cấp middleware
3. Người dùng chỉ có thể truy cập đơn ứng tuyển của chính mình trừ khi họ là quản lý câu lạc bộ/quản trị viên
4. Quản lý câu lạc bộ chỉ có thể quản lý các chiến dịch cho câu lạc bộ của họ
5. Xác thực và làm sạch đầu vào được áp dụng cho tất cả các yêu cầu

### Cân nhắc về hiệu suất
1. Phân trang được triển khai trên tất cả các điểm cuối danh sách
2. Chỉ mục cơ sở dữ liệu trên các trường được truy vấn thường xuyên
3. Chiến lược lưu trữ đệm cho dữ liệu chiến dịch công khai
4. Giới hạn tốc độ trên các điểm cuối gửi đơn ứng tuyển

### Quy tắc kinh doanh
1. Người dùng không thể ứng tuyển vào cùng một chiến dịch hai lần
2. Đơn ứng tuyển chỉ có thể được chỉnh sửa nếu chiến dịch cho phép và trạng thái đang chờ xử lý
3. Các chiến dịch nháp có thể được chỉnh sửa hoàn toàn, các chiến dịch đã công bố có khả năng chỉnh sửa hạn chế
4. Ngày kết thúc chiến dịch không thể ở trong quá khứ
5. Giới hạn đơn ứng tuyển tối đa được thực thi ở cấp chiến dịch

Tài liệu API này cung cấp cho đội ngũ frontend tất cả thông tin cần thiết để triển khai chức năng tuyển dụng, bao gồm các định dạng yêu cầu/phản hồi chi tiết, xử lý lỗi và các ràng buộc logic kinh doanh.

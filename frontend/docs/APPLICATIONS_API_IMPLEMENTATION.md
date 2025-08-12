# Applications API Implementation

## Tổng quan

Đã implement 2 API chính để người dùng xem tình trạng các đơn ứng tuyển của mình:

1. **API lấy tất cả đơn ứng tuyển của user** - `GET /api/users/:userId/applications`
2. **API xem chi tiết một đơn ứng tuyển** - `GET /api/applications/:applicationId`

## Các file đã tạo/cập nhật

### Backend (Club Service)

#### API Endpoints
- `GET /api/users/:userId/applications` - Lấy tất cả đơn ứng tuyển của user
- `GET /api/applications/:applicationId` - Xem chi tiết một đơn ứng tuyển
- `PUT /api/applications/:applicationId` - Cập nhật đơn ứng tuyển
- `DELETE /api/applications/:applicationId` - Rút đơn ứng tuyển

#### Files chính:
- `services/club/src/controllers/recruitmentCampaignController.js` - Controller xử lý API
- `services/club/src/services/recruitmentCampaignService.js` - Service logic
- `services/club/src/models/campaignApplication.js` - Model dữ liệu
- `services/club/src/routes/applicationRoutes.js` - Routes cho applications
- `services/club/src/routes/clubRoutes.js` - Routes cho user applications

### Frontend

#### Services
- `frontend/services/application.service.ts` - Service gọi API applications

#### Components
- `frontend/components/application-detail-dialog.tsx` - Dialog hiển thị chi tiết application
- `frontend/components/application-card.tsx` - Component card hiển thị application

#### Pages
- `frontend/app/profile/page.tsx` - Cập nhật trang profile để hiển thị applications
- `frontend/app/profile/applications/page.tsx` - Trang riêng xem tất cả applications

#### Hooks
- `frontend/hooks/use-applications.ts` - Hook quản lý applications state

## Cách sử dụng

### 1. Trong trang Profile

Trang profile đã được cập nhật để hiển thị section "Trạng thái đơn ứng tuyển" với:
- Danh sách các đơn ứng tuyển gần đây
- Trạng thái của từng đơn
- Nút "Xem tất cả" để chuyển đến trang applications riêng
- Nút "Chi tiết" để xem thông tin chi tiết
- Nút "Rút đơn" cho các đơn đang pending

### 2. Trang Applications riêng

Truy cập `/profile/applications` để xem:
- Tất cả đơn ứng tuyển với phân trang
- Bộ lọc theo trạng thái
- Tìm kiếm theo tên CLB hoặc chiến dịch
- Thống kê tổng số đơn ứng tuyển

### 3. Sử dụng Service

```typescript
import { applicationService } from '@/services/application.service'

// Lấy tất cả applications của user
const response = await applicationService.getUserApplications(userId, {
  page: 1,
  limit: 10,
  status: 'pending' // optional
})

// Lấy chi tiết một application
const detail = await applicationService.getApplication(applicationId)

// Rút đơn ứng tuyển
await applicationService.withdrawApplication(applicationId)
```

### 4. Sử dụng Hook

```typescript
import { useApplications } from '@/hooks/use-applications'

function MyComponent() {
  const { 
    applications, 
    loading, 
    pagination, 
    withdrawApplication 
  } = useApplications({
    userId: 'user-id',
    page: 1,
    limit: 10,
    status: 'pending' // hoặc 'all' để lấy tất cả
  })

  // Sử dụng data...
}
```

## Các trạng thái đơn ứng tuyển

- `pending` - Đang xử lý
- `active` - Được chấp nhận
- `rejected` - Bị từ chối
- `withdrawn` - Đã rút

## Tính năng chính

### 1. Hiển thị danh sách applications
- Phân trang
- Lọc theo trạng thái
- Tìm kiếm theo tên CLB/chiến dịch
- Loading states

### 2. Xem chi tiết application
- Thông tin CLB
- Thông tin chiến dịch tuyển thành viên
- Trạng thái và lịch sử
- Câu trả lời ứng tuyển
- Lý do từ chối (nếu có)

### 3. Quản lý application
- Rút đơn ứng tuyển (chỉ với đơn pending)
- Cập nhật thông tin (nếu được phép)
- Xem thông tin CLB liên quan

### 4. UX/UI
- Responsive design
- Loading skeletons
- Error handling
- Toast notifications
- Confirmation dialogs

## API Response Format

### Get User Applications
```json
{
  "success": true,
  "message": "User applications retrieved successfully",
  "data": {
    "applications": [
      {
        "id": "application-id",
        "status": "pending",
        "role": "member",
        "submitted_at": "2024-01-01T00:00:00Z",
        "campaign": {
          "id": "campaign-id",
          "title": "Tuyển thành viên mới",
          "description": "...",
          "start_date": "2024-01-01T00:00:00Z",
          "end_date": "2024-01-31T00:00:00Z",
          "status": "published"
        },
        "club": {
          "id": "club-id",
          "name": "Tên CLB",
          "description": "...",
          "logo": "logo-url"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 50,
      "items_per_page": 10
    }
  }
}
```

### Get Application Detail
```json
{
  "success": true,
  "message": "Application retrieved successfully",
  "data": {
    "id": "application-id",
    "status": "pending",
    "application_message": "Lời nhắn ứng tuyển",
    "application_answers": {
      "answers": [
        {
          "question_id": "q1",
          "answer": "Câu trả lời"
        }
      ]
    },
    "submitted_at": "2024-01-01T00:00:00Z",
    "rejection_reason": "Lý do từ chối (nếu có)"
  }
}
```

## Lưu ý bảo mật

- User chỉ có thể xem đơn ứng tuyển của chính mình
- API yêu cầu xác thực JWT thông qua API Gateway
- Validation đầy đủ cho tất cả input
- Error handling chi tiết

## Testing

Để test các API này:

1. Đăng nhập với user có đơn ứng tuyển
2. Truy cập `/profile` để xem section applications
3. Click "Xem tất cả" để đến trang applications riêng
4. Test các tính năng lọc, tìm kiếm, phân trang
5. Test xem chi tiết và rút đơn

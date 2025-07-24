# Application Form - Cập nhật tính năng mới

## Tổng quan
Component `ApplicationForm` đã được cập nhật với các tính năng mới để hỗ trợ tốt hơn việc ứng tuyển vào câu lạc bộ.

## Các tính năng mới

### 1. Cải thiện hệ thống câu hỏi ứng tuyển

#### Các loại câu hỏi được hỗ trợ:

**1. Text Input (`text`)**
- Câu hỏi trả lời ngắn
- Hỗ trợ giới hạn ký tự (`max_length`)
- Validation bắt buộc nếu `required: true`

**2. Textarea (`textarea`)**
- Câu hỏi trả lời dài
- Hiển thị số ký tự đã nhập/tối đa
- Hỗ trợ giới hạn ký tự (`max_length`)

**3. Select Dropdown (`select`)**
- Chọn một lựa chọn từ danh sách
- Options được định nghĩa trong `question.options`

**4. Checkbox (`checkbox`)**
- Chọn nhiều lựa chọn từ danh sách
- Hiển thị các lựa chọn đã chọn
- Lưu trữ dạng chuỗi phân cách bằng dấu phẩy

**5. Radio Button (`radio`) - MỚI**
- Chọn một lựa chọn từ danh sách (tương tự select nhưng UI khác)
- Phù hợp cho câu hỏi có ít lựa chọn

### 2. Tính năng Upload CV

#### Các tính năng chính:
- **Hỗ trợ định dạng**: PDF, DOC, DOCX
- **Giới hạn kích thước**: Tối đa 5MB
- **Drag & Drop**: Kéo thả file để upload
- **Preview**: Hiển thị thông tin file đã chọn
- **Validation**: Kiểm tra định dạng và kích thước file

#### UI/UX:
- Khu vực drop zone với icon và hướng dẫn
- Hiển thị thông tin file (tên, kích thước) sau khi upload
- Nút xóa file đã chọn
- Thông báo lỗi nếu file không hợp lệ

### 3. Cải thiện UI/UX

#### Hiển thị câu hỏi:
- Đánh số thứ tự câu hỏi
- Hiển thị rõ câu hỏi bắt buộc với dấu `*`
- Hiển thị giới hạn ký tự cho từng câu hỏi
- Thông báo lỗi validation cho từng câu hỏi

#### Responsive Design:
- Tối ưu cho mobile và desktop
- Layout linh hoạt với grid system
- Dialog modal tối ưu cho các màn hình khác nhau

## Cấu trúc dữ liệu

### ApplicationQuestion Interface
```typescript
interface ApplicationQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required: boolean;
  max_length?: number;
  options?: string[];
}
```

### Form Data Structure
```typescript
interface FormData {
  application_message: string;
  application_answers: Record<string, string>;
  cv_file?: File | null;
}
```

## Validation

### Validation Rules:
1. **Câu hỏi bắt buộc**: Không được để trống
2. **Giới hạn ký tự**: Không vượt quá `max_length`
3. **CV file**: 
   - Định dạng: PDF, DOC, DOCX
   - Kích thước: ≤ 5MB

### Error Handling:
- Hiển thị lỗi validation trực tiếp dưới từng câu hỏi
- Toast notification cho lỗi tổng thể
- Highlight field có lỗi bằng border đỏ

## Testing

### Test Page:
- Tạo trang test tại `/test-application-form`
- Mock data với đầy đủ các loại câu hỏi
- Có thể test các tính năng mới

### Test Cases:
1. **Các loại câu hỏi**: Test tất cả 5 loại
2. **Validation**: Test required fields và max_length
3. **CV Upload**: Test upload, validation, remove
4. **Responsive**: Test trên mobile và desktop

## Deployment Notes

### Dependencies:
- Tất cả UI components đã có sẵn
- Không cần thêm dependencies mới
- Tương thích với Next.js 15

### API Integration:
- Form data được gửi qua `applyToCampaign` và `updateApplication`
- CV file cần được xử lý ở backend để lưu trữ
- Cần cập nhật API để hỗ trợ multipart/form-data cho CV upload

## Usage Example

```tsx
<ApplicationForm
  campaign={campaign}
  onClose={() => setShowForm(false)}
  onSuccess={() => {
    // Handle success
    toast.success("Đơn ứng tuyển đã được gửi thành công!")
  }}
  existingApplication={existingApp} // Optional, for editing
  isEditing={false} // Optional, default false
/>
```

## Future Enhancements

1. **File Preview**: Xem trước nội dung CV
2. **Multiple Files**: Cho phép upload nhiều file
3. **Rich Text Editor**: Editor WYSIWYG cho textarea
4. **Conditional Questions**: Câu hỏi có điều kiện
5. **Auto Save**: Tự động lưu draft
6. **Progress Indicator**: Hiển thị tiến độ hoàn thành form

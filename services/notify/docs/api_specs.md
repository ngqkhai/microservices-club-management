# Đặc tả API: Notify-Service 📨

---

## I. Tổng quan

* **Mô tả:**  
  Lắng nghe event (RSVPCreated, PaymentSucceeded, MemberAdded) → gửi email/SMS + lưu log.  
* **Công nghệ sử dụng (Stack):**  
  Node.js, Express, nodemailer, twilio  
* **Cơ sở dữ liệu:**  
  MongoDB: collection `notifications`.

---

## II. Xác thực & Ủy quyền

* **Authentication:**  
  Internal API `Authorization: Service <SERVICE_TOKEN>`  
* **Authorization:**  
  Chỉ service nội bộ có token hợp lệ.

---

## III. Các Endpoint API

### 1. POST /notify/email

* **Mô tả:** Gửi email theo template.  
* **Authorization:** `Service <SERVICE_TOKEN>`  
* **Request Body:**
    ```json
    {
      "to": "user@example.com",
      "subject": "Xác nhận RSVP",
      "template": "rsvp_confirm",
      "data": {
        "event_title": "Workshop NestJS",
        "qr_code_url": "https://…"
      }
    }
    ```
* **Response 200 OK:**
    ```json
    { "message": "Email đã được gửi." }
    ```

---

*(Tương tự cho SMS nếu cần)*

---

## IV. Luồng nghiệp vụ

* **Consumers:**  
  - `RSVPCreated` → `/notify/email` (`rsvp_confirm`)  
  - `PaymentSucceeded` → invoice  
  - `MemberAdded` → role_changed  

---

## V. Cấu trúc Database

* **Loại:** MongoDB  
* **Collection `notifications`:**  
  - `_id` ObjectId  
  - `user_id` UUID  
  - `channel` ENUM(EMAIL,SMS)  
  - `subject` string  
  - `body` string  
  - `status` ENUM(PENDING,SENT,FAILED)  
  - `sent_at` ISODate  

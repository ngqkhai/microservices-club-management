# Đặc tả API: Finance-Service 💰

---

## I. Tổng quan

* **Mô tả:**  
  Finance-Service xử lý thanh toán qua Momo, ghi log saga và publish event khi thanh toán thành công.  
* **Công nghệ sử dụng (Stack):**  
  Go, Fiber, go-sqlx, kolide/kit Saga helpers  
* **Cơ sở dữ liệu:**  
  PostgreSQL: hai bảng `payments` và `transactions`.

---

## II. Xác thực & Ủy quyền

* **Authentication:**  
  - `POST /payments` yêu cầu header `Authorization: Bearer <JWT>`.  
  - `POST /payments/callback` (webhook) yêu cầu HMAC secret header.  
* **Authorization:**  
  - Người dùng đã đăng nhập mới khởi tạo thanh toán.  
  - Webhook bypass JWT, kiểm qua HMAC.

---

## III. Các Endpoint API

### 1. POST /payments

* **Mô tả:** Khởi tạo thanh toán Momo, trả về URL redirect.  
* **Roles Required:** bất kỳ user đã đăng nhập  
* **Request Body:**
    ```json
    {
      "event_id": "60afbbf1c9ae4a3d2c7e8be1", // ObjectId event
      "amount": 100000                      // số tiền (VNĐ)
    }
    ```
* **Response 201 Created:**
    ```json
    {
      "payment_id": "pay_abc123",
      "redirect_url": "https://momo.vn/checkout?token=xyz"
    }
    ```
* **Errors:** 400, 401, 500.

---

### 2. POST /payments/callback

* **Mô tả:** Nhận callback từ Momo sau khi thanh toán.  
* **Roles Required:** HMAC secret  
* **Request Body:**
    ```json
    {
      "payment_id": "pay_abc123",
      "status": "SUCCEEDED",
      "momo_txn_id": "momo789",
      "amount": 100000
    }
    ```
* **Response 200 OK:**
    ```json
    {
      "message": "Callback processed."
    }
    ```
* **Publish Event:** topic `finance.payment`  
    ```json
    {
      "payment_id": "pay_abc123",
      "event_id": "60afbbf1c9ae4a3d2c7e8be1",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "SUCCEEDED",
      "amount": 100000
    }
    ```
* **Errors:** 400, 401, 500.

---

## IV. Luồng nghiệp vụ & Tương tác

* **Saga Flow (Choreography):**
  1. Client → `POST /payments`.  
  2. Momo → gọi `POST /payments/callback`.  
  3. Cập nhật `payments.status = SUCCEEDED`, ghi record vào `transactions`.  
  4. Publish event `finance.payment`.  
  5. Notify-Service gửi hóa đơn; Report-Service cập nhật báo cáo; Event-Service có thể mark paid.  

---

## V. Cấu trúc Database

* **Loại Database:** PostgreSQL  
* **Schema:**
  * **Table `payments`:**  
      * `id`: UUID PK (`pay_abc123`)  
      * `event_id`: UUID / ObjectId  
      * `amount`: BIGINT  
      * `momo_txn`: VARCHAR  
      * `status`: ENUM('PENDING','SUCCEEDED','FAILED')  
      * `created_at`: TIMESTAMP  
  * **Table `transactions`:**  
      * `id`: UUID PK  
      * `payment_id`: UUID FK → `payments.id`  
      * `action`: VARCHAR (ví dụ 'CREATE', 'CALLBACK')  
      * `state`: VARCHAR  
      * `occured_at`: TIMESTAMP  

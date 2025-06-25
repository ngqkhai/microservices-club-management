# Đặc tả API: Club-Service 🏛️

---

## I. Tổng quan

* **Mô tả:**  
  Quản lý Club và quyền thành viên: tạo/xóa Club, thêm/xóa/chuyển role thành viên.  
* **Công nghệ sử dụng (Stack):**  
  Java, Spring Boot (WebFlux)  
* **Cơ sở dữ liệu:**  
  PostgreSQL: hai bảng `clubs` và `memberships`.

---

## II. Xác thực & Ủy quyền

* **Authentication:**  
  Header `Authorization: Bearer <JWT>`  
* **Authorization:**  
  - `SYSTEM_ADMIN` được phép tạo và xóa Club.  
  - `MANAGER` của Club (kiểm via `memberships`) được phép thêm, xóa, chuyển role thành viên.  
  - Kiểm quyền triển khai qua Spring Security annotation `@PreAuthorize`.

---

## III. Các Endpoint API

### 1. POST /clubs

* **Mô tả:** Tạo Club mới.  
* **Roles Required:** `SYSTEM_ADMIN`  
* **Request Body:**
    ```json
    {
      "name": "CLB AI",               // string (bắt buộc) - Tên CLB
      "description": "Nghiên cứu AI" // string (tùy chọn) - Mô tả CLB
    }
    ```
* **Response 201 Created:**
    ```json
    {
      "id": 123, 
      "name": "CLB AI",
      "description": "Nghiên cứu AI",
      "created_by": "550e8400-e29b-41d4-a716-446655440000"
    }
    ```
* **Errors:**  
  * 400 Bad Request, 403 Forbidden, 500 Internal Server Error.

---

### 2. GET /clubs/{id}

* **Mô tả:** Lấy chi tiết Club, bao gồm danh sách thành viên.  
* **Roles Required:** bất kỳ user đã đăng nhập  
* **Path Parameter:**
  * `id` (integer, bắt buộc) – ID của Club  
* **Response 200 OK:**
    ```json
    {
      "id": 123,
      "name": "CLB AI",
      "description": "Nghiên cứu AI",
      "members": [
        {
          "user_id": "550e8400-e29b-41d4-a716-446655440000",
          "role": "MANAGER",
          "joined_at": "2025-06-01T08:00:00Z"
        }
      ]
    }
    ```
* **Errors:**  
  * 404 Not Found, 403 Forbidden.

---

### 3. POST /clubs/{id}/members

* **Mô tả:** Thêm thành viên vào Club.  
* **Roles Required:** `MANAGER` của Club hoặc `SYSTEM_ADMIN`  
* **Path Parameter:**
  * `id` – ID của Club  
* **Request Body:**
    ```json
    {
      "user_id": "660e8400-e29b-41d4-a716-446655440111", // UUID thành viên
      "role": "MEMBER"                                   // ENUM: MANAGER | MEMBER
    }
    ```
* **Response 201 Created:**
    ```json
    {
      "message": "Thêm thành viên thành công."
    }
    ```
* **Publish Event:** topic `club.member`  
    ```json
    {
      "club_id": 123,
      "user_id": "660e8400-e29b-41d4-a716-446655440111",
      "role": "MEMBER"
    }
    ```
* **Errors:**  
  * 400 Bad Request, 403 Forbidden.

---

### 4. DELETE /clubs/{id}/members/{userId}

* **Mô tả:** Xóa thành viên khỏi Club.  
* **Roles Required:** `MANAGER` của Club hoặc `SYSTEM_ADMIN`  
* **Path Parameters:**
  * `id` – ID Club  
  * `userId` – UUID thành viên  
* **Response 204 No Content**  
* **Errors:**  
  * 404 Not Found, 403 Forbidden.

---

### 5. PUT /clubs/{id}/members/{userId}

* **Mô tả:** Thay đổi role thành viên trong Club.  
* **Roles Required:** `MANAGER` của Club hoặc `SYSTEM_ADMIN`  
* **Path Parameters:** như trên  
* **Request Body:**
    ```json
    {
      "role": "MANAGER" // ENUM: MANAGER | MEMBER
    }
    ```
* **Response 200 OK:**
    ```json
    {
      "message": "Cập nhật role thành công."
    }
    ```
* **Publish Event:** topic `club.member.updated`  
    ```json
    {
      "club_id": 123,
      "user_id": "660e8400-e29b-41d4-a716-446655440111",
      "new_role": "MANAGER"
    }
    ```
* **Errors:**  
  * 400 Bad Request, 403 Forbidden, 404 Not Found.

---

## IV. Luồng nghiệp vụ & Tương tác

* **Add Member Flow:**
  1. Client gọi `POST /clubs/{id}/members`.  
  2. Authorization middleware kiểm `MANAGER` hoặc `SYSTEM_ADMIN`.  
  3. Insert record vào `memberships`.  
  4. Publish event `club.member`.  
* **Consumers:**  
  - Notify-Service lắng nghe để gửi email thông báo.  
  - Report-Service lắng nghe để cập nhật dashboard.  
* **Saga:** Không áp dụng.

---

## V. Cấu trúc Database

* **Loại Database:** PostgreSQL  
* **Schema:**
  * **Table `clubs`:**
      * `id`: SERIAL PK  
      * `name`: VARCHAR NOT NULL  
      * `description`: TEXT  
      * `created_by`: UUID FK → `users.id`  
      * `created_at`: TIMESTAMP  
  * **Table `memberships`:**
      * `user_id`: UUID FK → `users.id`  
      * `club_id`: INT FK → `clubs.id`  
      * `role`: ENUM('MANAGER','MEMBER')  
      * `joined_at`: TIMESTAMP  
      * **Primary Key:** (`user_id`,`club_id`)  

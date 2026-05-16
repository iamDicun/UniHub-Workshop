# Đặc tả: Kiểm soát truy cập và Phân quyền (Auth)

## Mô tả
Hệ thống sử dụng cơ chế xác thực không trạng thái (Stateless Authentication) dựa trên JSON Web Tokens (JWT). Việc phân quyền (Authorization) được thực thi ở mức Middleware của Backend API để đảm bảo chỉ những người dùng hợp lệ mới được truy cập vào các tài nguyên tương ứng.

## Luồng chính
1. Người dùng gửi thông tin đăng nhập (email, password) tới endpoint `/api/auth/login`.
2. Backend kiểm tra thông tin trong bảng `users`. Nếu hợp lệ, hệ thống sẽ mã hóa một chuỗi JWT bao gồm payload: `{ id, role }` kèm theo chữ ký bí mật.
3. Backend trả về JWT cho Client.
4. Client lưu trữ token ở Local Storage hoặc Async Storage.
5. Khi người dùng thực hiện các thao tác (vd: đăng ký workshop, thêm staff), Client gắn token vào Header: `Authorization: Bearer <token>`.
6. Hệ thống đi qua middleware `protect`:
   - Xác thực chữ ký token.
   - Giải mã lấy `id` và `role`.
   - Tìm user trong cơ sở dữ liệu để đảm bảo user vẫn còn tồn tại.
7. Hệ thống đi qua middleware `authorize('admin', 'student', ...)`:
   - Kiểm tra `role` của user có nằm trong danh sách được phép không.
   - Nếu có, cho qua (gọi controller tiếp theo).
   - Nếu không, chặn lại với lỗi 403 Forbidden.

## Kịch bản lỗi
- **Token hết hạn hoặc sai chữ ký:** Middleware `protect` trả về 401 Unauthorized. Client sẽ tự động logout người dùng.
- **Role không phù hợp:** Một sinh viên cố gắng truy cập endpoint của Admin (ví dụ `POST /api/workshops`). Middleware `authorize` trả về 403 Forbidden.
- **User bị xóa nhưng token còn hạn:** Middleware `protect` sẽ kiểm tra lại DB và không tìm thấy user, trả về 401 Unauthorized.

## Ràng buộc
- Token cần có thời gian hết hạn (Expiration Time - TTL) hợp lý (ví dụ: 7 ngày cho app check-in offline, 24 giờ cho Admin web).
- Mật khẩu lưu trong DB bắt buộc phải được băm (hashing) sử dụng `bcrypt` (kèm theo salt ngẫu nhiên) để đảm bảo tính an toàn nếu lộ lọt dữ liệu.

## Tiêu chí chấp nhận
- Người dùng `student` chỉ có thể gọi API xem và đăng ký, gọi API Admin sẽ bị lỗi 403.
- Người dùng `staff` chỉ có thể gọi API check-in.
- Admin không thể tự đăng ký Workshop dưới tư cách sinh viên (trừ phi dùng tài khoản sinh viên).
- Các API trả về đúng mã HTTP Status chuẩn: 401 khi chưa login, 403 khi thiếu quyền.

---

## Sơ đồ luồng (Sequence Diagram)

### Luồng đăng nhập và xác thực request

```mermaid
sequenceDiagram
    participant C as Client (Web/Mobile)
    participant API as Backend API
    participant DB as PostgreSQL
    participant MW as Middleware (protect + authorize)

    Note over C,DB: === Đăng nhập ===
    C->>API: POST /api/auth/login { email, password }
    API->>DB: SELECT * FROM users WHERE email = $1
    DB-->>API: { id, password_hash, role }
    API->>API: bcrypt.compare(password, password_hash)
    
    alt Sai mật khẩu
        API-->>C: 401 Unauthorized
    else Đúng mật khẩu
        API->>API: JWT.sign({ id, role }, JWT_SECRET)
        API-->>C: 200 { token, user }
    end

    Note over C,DB: === Gọi API được bảo vệ ===
    C->>API: GET /api/workshops<br/>Authorization: Bearer <token>
    
    API->>MW: protect middleware
    MW->>MW: jwt.verify(token, JWT_SECRET)
    alt Token hết hạn / sai chữ ký
        MW-->>C: 401 Unauthorized
    end
    MW->>DB: SELECT * FROM users WHERE id = $1
    alt User không tồn tại
        MW-->>C: 401 Unauthorized
    end
    MW->>MW: Gắn req.user = { id, role }
    
    API->>MW: authorize('admin', 'student')
    alt Role không nằm trong danh sách
        MW-->>C: 403 Forbidden
    else Role hợp lệ
        MW->>API: next() → Controller
        API-->>C: 200 { data }
    end
```

### Sơ đồ phân quyền (RBAC Matrix)

```mermaid
graph LR
    subgraph Users["Người dùng"]
        Student["Sinh viên<br/>(student)"]
        Admin["Ban tổ chức<br/>(admin)"]
        Staff["Nhân sự<br/>(staff)"]
    end

    subgraph APIs["API Endpoints"]
        A1["GET /workshops<br/>Xem danh sách"]
        A2["POST /register<br/>Đăng ký"]
        A3["POST /payments<br/>Thanh toán"]
        A4["CRUD /workshops<br/>Quản lý"]
        A5["GET /admin/stats<br/>Thống kê"]
        A6["POST /users/sync<br/>Đồng bộ CSV"]
        A7["POST /checkins<br/>Quét QR"]
    end

    Student -->|✅| A1
    Student -->|✅| A2
    Student -->|✅| A3
    Student -->|❌ 403| A4
    Student -->|❌ 403| A5
    
    Admin -->|✅| A1
    Admin -->|✅| A4
    Admin -->|✅| A5
    Admin -->|✅| A6
    
    Staff -->|✅| A7
    Staff -->|❌ 403| A2
```

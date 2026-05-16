## Thiết kế cơ sở dữ liệu

### 1. Phân tích đặc tính lưu trữ (Storage Workload)
Dựa trên yêu cầu của hệ thống UniHub Workshop, bài toán mang đặc trưng rõ nét của hệ thống **OLTP (Online Transaction Processing)**:
* **Hành vi dữ liệu:** Tần suất cao các thao tác đọc/ghi nhỏ và liên tục (sinh viên bấm đăng ký, hệ thống cập nhật số ghế, nhân viên check-in). Hệ thống đòi hỏi thời gian phản hồi (latency) cực thấp.
* **Yêu cầu tính toàn vẹn:** Thao tác đăng ký chỗ ngồi (có giới hạn) và luồng thanh toán yêu cầu tuân thủ nghiêm ngặt chuẩn ACID để đảm bảo tính nhất quán (Strong Consistency).
* **Kết luận:** Hệ thống ưu tiên sử dụng RDBMS (Hệ quản trị CSDL quan hệ) làm trung tâm dữ liệu cốt lõi, thay vì các giải pháp OLAP (chuyên cho phân tích dữ liệu lớn) hay HTAP.

### 2. Lựa chọn Cơ sở dữ liệu
Hệ thống sử dụng **PostgreSQL** làm cơ sở dữ liệu chính.
* **Lý do lựa chọn:**
    * **Đảm bảo ACID & Xử lý đồng thời (Concurrency):** PostgreSQL cung cấp cơ chế Row-level locking cực kỳ mạnh mẽ, giúp giải quyết triệt để bài toán tranh chấp (Race Condition) khi hàng trăm sinh viên tranh nhau chỗ ngồi.
    * **Quan hệ dữ liệu chặt chẽ:** Các thực thể Users, Workshops, Registrations, Payments có mối quan hệ phụ thuộc rõ ràng (Schema cố định), phù hợp với cấu trúc bảng của SQL.
    * **Hỗ trợ UUID & Constraints:** Khả năng định nghĩa các ràng buộc (Constraints) ở tầng database giúp ngăn chặn rác dữ liệu và overbooking ngay tại "chốt chặn cuối cùng".

*(Lưu ý: Để giải quyết hạn chế khó mở rộng ngang (scale-out) của RDBMS khi chịu tải đột biến, kiến trúc tổng thể đã kết hợp thêm Redis để rate-limiting và RabbitMQ làm message queue nhằm giãn tải cho PostgreSQL).*

### 3. Schema các Entity chính (Lược đồ CSDL)
Hệ thống được thiết kế đạt chuẩn hóa (Normalization) để tránh dư thừa dữ liệu. Dưới đây là các bảng cốt lõi:

* **`users`**: Quản lý thông tin định danh và phân quyền. Sử dụng `id` (UUID) làm khóa chính để tăng tính bảo mật, tránh lộ số lượng người dùng.
* **`workshops`**: Lưu trữ thông tin sự kiện. Tích hợp cột `capacity` (tổng số ghế) và `available_seats` (ghế còn trống). Áp dụng ràng buộc `CHECK (available_seats >= 0)` để CSDL tự động từ chối các giao dịch vượt quá giới hạn.
* **`registrations`**: Bảng trung gian thể hiện quan hệ n-n giữa User và Workshop. Cài đặt `UNIQUE (student_id, workshop_id)` để một sinh viên không thể đăng ký một workshop hai lần.
* **`payments`**: Quản lý giao dịch. Sử dụng `idempotency_key UNIQUE` kết hợp `UNIQUE INDEX unique_success_payment` để loại trừ hoàn toàn rủi ro trừ tiền hai lần (Double Charge) khi client gửi request retry.
* **`checkins`**: Phục vụ nghiệp vụ soát vé. Trạng thái `status (pending, synced)` giúp theo dõi luồng check-in offline.

### 4. Các quyết định kỹ thuật quan trọng (ADR - Architecture Decision Records)

#### ADR 1: Chiến lược Indexing (Chỉ mục) theo giai đoạn
* **Vấn đề:** 12.000 sinh viên sẽ truy cập và tạo ra lượng thao tác `INSERT` khổng lồ vào bảng `registrations` trong 10 phút đầu tiên.
* **Quyết định:** Không lạm dụng Index trên bảng `registrations` trong thiết kế ban đầu. Chỉ thiết lập Index trên khóa chính và các khóa ngoại bắt buộc.
* **Lý do (Trade-off):** Index giúp tốc độ đọc nhanh hơn (log n) nhưng làm chậm đáng kể quá trình ghi dữ liệu[cite: 426, 444]. Việc tối ưu tốc độ `INSERT` (Write-heavy) là ưu tiên số 1 trong giai đoạn tải đột biến. [cite_start]Chiến lược lâu dài là triển khai hệ thống, monitor các truy vấn thực tế của user (qua Slow Query Log), từ đó thiết lập các Composite Index (Chỉ mục kết hợp) chính xác theo pattern truy xuất thực tế[cite: 450, 451].

#### ADR 2: Đánh đổi tính Nhất quán (Consistency Trade-off) dựa trên nghiệp vụ
Hệ thống linh hoạt điều chỉnh giữa Strong Consistency và Eventual Consistency tùy theo bối cảnh nghiệp vụ để đạt hiệu suất tốt nhất
* **Luồng đăng ký & Thanh toán:** Áp dụng **Strong Consistency (Nhất quán mạnh)**. Dữ liệu về số chỗ trống (`available_seats`) và trạng thái thanh toán phải được đồng bộ ngay lập tức và chính xác tuyệt đối, chấp nhận độ trễ (latency) cao hơn.

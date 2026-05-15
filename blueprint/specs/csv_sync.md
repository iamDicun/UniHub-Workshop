# Đặc tả: Đồng bộ sinh viên từ file CSV (CSV Synchronization)

## Mô tả
Hệ thống cũ không cung cấp API mà chỉ hỗ trợ trích xuất dữ liệu sinh viên ra file CSV. Quá trình đồng bộ này đòi hỏi tính tương thích với khối lượng dữ liệu lớn mà không gây đình trệ (downtime) hay chiếm dụng quá nhiều bộ nhớ (RAM) của ứng dụng Node.js. Chức năng sẽ bao gồm khả năng lưu file tạm thời qua AWS S3 và import dữ liệu sử dụng luồng (Stream) trực tiếp vào bảng staging của PostgreSQL, sau đó dùng lệnh tối ưu (`UPSERT`/`MERGE`) để cập nhật vào bảng dữ liệu chính.

## Người dùng liên quan
- **Ban tổ chức / Quản trị viên (Admin):** Có thể nhận URL file CSV và đưa lên hệ thống để đồng bộ.
- **Hệ thống (Cron Job / Worker):** Chạy tiến trình xử lý import dữ liệu một cách bất đồng bộ (Asynchronous) thông qua RabbitMQ, giúp API không bị treo.

## Quy trình nghiệp vụ
1. **Upload File CSV:** 
   - Thay vì gửi cả file trực tiếp qua API đồng bộ, frontend của admin sẽ lấy Presigned URL, upload trực tiếp lên Storage (AWS S3) và nhận lại `fileKey`.
2. **Kích hoạt đồng bộ:** 
   - Admin gọi API `POST /api/users/sync` truyền vào `fileKey`.
   - Hệ thống tạo một Job (ghi nhận vào bảng `sync_jobs`) với trạng thái `Pending`.
3. **Điều phối Queue:**
   - Khi `isImmediate=true` (đồng bộ ngay), API sẽ phát một Event vào `user_sync_queue` thông qua RabbitMQ để Worker tiến hành lấy file và xử lý ngay tức thì.
   - Khi `isImmediate=false` (chờ ban đêm), Job cứ nằm trong CSDL. Một Cron Job tự động (được cấu hình thời gian qua cấu hình môi trường, vd: `SYNC_CRON_SCHEDULE="0 2 * * *"`) tiến hành quét các Job `Pending` lúc 2 giờ sáng và nạp vào RabbitMQ.
4. **Xử lý dữ liệu không chiếm RAM (Pipeline Stream):**
   - Worker nhận thông báo có file cần đồng bộ từ Queue.
   - Worker tiến hành làm rỗng bảng tạm `staging_users` (cấu trúc của bảng này nhẹ, không có các constraints phức tạp).
   - Tiến hành thiết lập đường ống (pipe) stream: Đọc trực tiếp từ Data Stream của `S3 Object` và đổ trực tiếp vào Stream tiếp nhận của `PostgreSQL COPY` bằng thư viện `pg-copy-streams`.
   - Kỹ thuật này giúp chuyển bao nhiêu GB tuỳ thích vì RAM không hề lưu cấu trúc JSON từng hàng mà chỉ chuyển luồng Byte.
5. **Cập nhật dữ liệu từ Staging:**
   - Dùng lệnh `INSERT INTO ... SELECT ... ON CONFLICT (...) DO UPDATE` để dung hợp các sinh viên trùng từ bảng `staging_users` chuyển qua bảng cấu trúc đầy đủ `users`.
   - Hoàn tất và cập nhật trạng thái `sync_jobs` thành `Completed`.

## Kịch bản lỗi
- **Lỗi kết nối tới S3 / Mất link file CSV:** Worker sẽ chạy catch lỗi, cập nhật Job về trạng thái `Failed` với nguyên nhân trong DB. Admin có thể xem lại trong ứng dụng.
- **Lỗi định dạng SQL COPY (File rác):** Quá trình pipe bị đóng, rollback transaction chưa thành công (nếu có) và Job chuyển thành `Failed`.

## Ràng buộc
- Biến cấu hình (Environment Variable) cần có các cờ về AWS (`AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`), biến thiết lập thời gian cho Cron Job ban đêm (`SYNC_CRON_SCHEDULE`).
- Bảng database chính phải có Unique Constraint cho `student_code` để Upsert không bị lỗi kép.

## Tiêu chí chấp nhận
- Upload một file 500k-1M record không làm chết server, RAM không vọt theo cấp số nhân (được kiểm chứng bằng công cụ monitor/top cmd).
- Nhấp nút "Sync Now" thì quá trình bắt đầu sau tối đa 2s, nếu không chọn, qua rạng sáng hệ thống cập nhật tự động.
- Dữ liệu trùng sẽ được ghi đè thông tin mới từ file CSV, bản ghi mới được thêm và bản ghi cũ (không có trong CSV) vẫn giữ lại (giả dụ hệ thống có lưu account riêng).

## Phân tích Kiến trúc: Ưu nhược điểm và Khả năng chịu tải (Architecture Analysis)

Dựa trên thực tế đã triển khai (S3 Presigned URL, RabbitMQ, pg-copy-streams, Staging Table, Code Base Python tạo Test Data), dưới đây là đánh giá kỹ thuật chi tiết:

### 1. Khả năng chịu tải (Load-bearing / Scalability)
- **Tải ở luồng Upload (API & Network - Băng thông chiều vào):** 
  - Hoàn toàn **không gây áp lực** lên API Server (Node.js). 
  - Nhờ sử dụng **Presigned URL**, Frontend trực tiếp đẩy stream file CSV lên AWS S3. Băng thông (Bandwidth), thẻ nhớ lưu trữ (Disk I/O) và TCP Connections sống thọ (Long-lived connections) đều do hạ tầng của AWS hấp thụ. Server API hiện tại chỉ chịu tải cho việc tính toán chữ ký số tạo ra `uploadUrl` (mất vài mili-giây).
- **Tải ở luồng Điều phối Queue (RabbitMQ):**
  - Hệ thống sở hữu bộ giảm xóc vô hạn. Khi có sự cố lưu lượng đột biến (ví dụ hàng chục Ban tổ chức cùng nhấn Sync Now), RabbitMQ giúp cân bằng tải tự nhiên. Node.js không cần tự ngậm nhiều Background Tasks cùng lúc. 
  - Nếu số lượng Job vượt quá năng lực xử lý, DevOps chỉ cần nâng cấu hình replicas của `api-worker` qua `docker-compose up --scale worker=3`.
- **Tải ở mức độ Bộ nhớ của Worker Node (RAM Allocation):**
  - Kỹ thuật **Stream Piping (`S3 Byte Stream` $\rightarrow$ `Node Node Stream` $\rightarrow$ `Postgres COPY Stream`)** duy trì độ phức tạp bộ nhớ là $O(1)$.
  - Thay vì load CSV vào String Array/JSON, quá trình đồng bộ cấp phát buffer siêu nhỏ (chỉ vài chục MB). Kết quả: Dung lượng CSV 10MB hay 100GB thì Server API hoàn toàn **không bị Out-Of-Memory (OOM)**.
- **Tải ở mức Tầng Cơ sở dữ liệu (PostgreSQL):**
  - Lệnh `COPY FROM STDIN` của PostgreSQL là Bulk Operation tối thượng, nén data trực tiếp vào Pages của ổ đĩa.
  - Sau đó, thao tác ghép cột `INSERT INTO users ... SELECT ... ON CONFLICT (...) DO UPDATE` được chính Query Engine của CSDL thực thi nội bộ (In-DB execution), loại bỏ 100% tình trạng **N+1 Query lag** của ORM hay Node.js truyền thống.

### 2. Ưu điểm (Pros)
- **Zero-Downtime & High UX:** API phản hồi `2xx` ngay lập tức để User biết Job đã nhận. API không bị Blocking I/O do parsing CSV.
- **High Availability & Fault Tolerance:** Thiết kế hướng Message-Driven đảm bảo kháng lỗi toàn diện. Nếu một API Worker Container bị "die" hoặc sập nguồn khi đang xử lý ngang file CSV, message chứa `fileKey` trong thỏ (RabbitMQ) sẽ không bị mất (do không nhận được `ack`). Khởi động lại Server, quá trình pipe stream sẽ lập tức được móc chạy từ đầu.
- **Bảo mật & Clean Data:** Không nhận file rác qua API. Rác bị cách ly trên S3 Bucket (có thể bị delete routine gạt đi). Mật khẩu của tài khoản mới sinh cũng đã được chốt bằng Plain text chuẩn cấu trúc ghép chuỗi (`student_code` + `email prefix`) cực xịn ngay thẳng trong tầng SQL, tối giản code middleware.

### 3. Khuyết điểm & Rủi ro Cần đánh đổi (Cons / Trade-offs)
- **Eventual Consistency (Trễ dữ liệu cục bộ):** Quá trình nhập liệu là bất đồng bộ. Sinh viên mới có mặt trong hệ thống cần độ trễ thời gian tùy thuộc kích cỡ file. Frontend phải implement logic hiển thị Job Status (Pending/Processing/Done) thay vì show dữ liệu đồng bộ ngay lập tức.
- **I/O Spike trên Database:** Bước cuối cùng áp `ON CONFLICT` từ `staging_users` sang `users` có thể dồn Write IOPS tới biên. Row-level Lock sẽ tác động lên bảng `users`. Nếu bảng dính tới Login nhiều của hàng ngàn sinh viên lúc đang Merge có thể gặp độ delay của Query. **Khắc phục sẵn có:** Cơ chế setup Node-cron (Cron job vào ban đêm 2h sáng).
- **Khối lượng hệ thống cồng kềnh (Architecture Complexity):** Setup yêu cầu cần maintain một lưới đa hệ như Docker + Postgres + RabbitMQ + Redis (option) + AWS. Đối với đội kỹ thuật quản trị, cần phải biết tracing log cross-container (như thao tác check file `config/db.js` crash ở Nginx 502 phía trên).
- **S3 Storage & Local Storage bloat:** Phải tự thiết lập Lifecycle Policy AWS S3 xóa CSV thô cũ để né phí AWS vô định. Phải liên tục setup `TRUNCATE staging_users` trước và sau mỗi đợt. Bảng History `sync_jobs` sẽ phình to ra theo năm tháng.

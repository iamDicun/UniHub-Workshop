# UniHub Workshop — Project Proposal

## Vấn đề

Trường Đại học A tổ chức **"Tuần lễ kỹ năng và nghề nghiệp"** hàng năm — sự kiện kéo dài 5 ngày, mỗi ngày có 8–12 workshop diễn ra song song tại nhiều phòng khác nhau. Hiện tại, ban tổ chức quản lý toàn bộ quy trình bằng **Google Form** kết hợp với **email thủ công**.

Phương thức này bộc lộ những hạn chế nghiêm trọng khi quy mô ngày càng lớn:

- **Không kiểm soát được số lượng đăng ký theo thời gian thực**: Google Form không có cơ chế giới hạn chỗ ngồi (capacity cap). Sinh viên vẫn gửi form dù workshop đã kín chỗ, buộc ban tổ chức phải lọc thủ công và gửi email từ chối — gây chậm trễ và bức xúc cho sinh viên.
- **Tranh chấp chỗ ngồi (Race Condition)**: Khi hàng trăm sinh viên cùng bấm đăng ký một workshop 60 chỗ, không có cơ chế nào đảm bảo hai sinh viên không cùng nhận chiếc vé cuối cùng.
- **Không có check-in điện tử**: Việc điểm danh tại cửa phòng hoàn toàn thủ công bằng giấy, dễ nhầm lẫn, chậm và không thể tổng hợp dữ liệu tức thời.
- **Tải trọng đột biến**: Dự kiến 12.000 sinh viên truy cập trong 10 phút đầu mở đăng ký, 60% dồn vào 3 phút đầu tiên. Google Form không được thiết kế để chịu tải ở mức này, dẫn đến nguy cơ sập form, mất dữ liệu.
- **Không tích hợp được với hệ thống quản lý sinh viên cũ**: Hệ thống hiện hữu chỉ xuất file CSV hàng đêm, không có API. Việc đối chiếu danh sách sinh viên hợp lệ hoàn toàn thủ công.
- **Không hỗ trợ thanh toán**: Các workshop có thu phí không có cơ chế thanh toán trực tuyến, buộc sinh viên phải đóng tiền mặt.

## Mục tiêu

Xây dựng hệ thống **UniHub Workshop** nhằm số hóa toàn bộ quy trình từ đăng ký đến check-in tại sự kiện, với các mục tiêu định lượng:

- Hỗ trợ **12.000 sinh viên** truy cập đồng thời trong **10 phút** đầu mở đăng ký, với 60% lưu lượng dồn vào 3 phút đầu tiên mà không sập hệ thống.
- **Không có tình trạng bán lố vé** (overselling): mỗi workshop chỉ có đúng `capacity` sinh viên đăng ký thành công, không âm ghế.
- **Giảm thời gian chờ phản hồi** xuống dưới 2 giây cho các thao tác đọc (xem danh sách workshop) và dưới 5 giây cho thao tác ghi (đăng ký), ngay cả trong điều kiện tải cao.
- **Check-in offline**: Nhân sự có thể quét mã QR check-in ngay cả khi mất mạng Wi-Fi / 4G, dữ liệu tự đồng bộ khi có kết nối trở lại.
- **Tích hợp thanh toán trực tuyến** qua PayOS cho các workshop có thu phí, với cơ chế chống trừ tiền hai lần (Idempotency).
- **Đồng bộ dữ liệu sinh viên từ CSV** của hệ thống cũ mà không gây gián đoạn (zero-downtime), không giới hạn bởi kích thước file (xử lý streaming).
- **AI tóm tắt tài liệu workshop**: Admin upload PDF, hệ thống tự động sinh bản tóm tắt hiển thị trên trang workshop.

## Người dùng và nhu cầu

| Nhóm | Mô tả | Nhu cầu cốt lõi |
|---|---|---|
| **Sinh viên** | Người tham dự workshop, khoảng 12.000 người | Xem lịch workshop kèm số chỗ còn lại theo thời gian thực; đăng ký nhanh, công bằng; nhận mã QR để check-in; nhận email/app thông báo xác nhận; thanh toán online nếu workshop có phí. Điều quan trọng nhất: **tốc độ và tính công bằng khi giành chỗ**. |
| **Ban tổ chức (Admin)** | Người quản lý sự kiện, khoảng 5–10 người | Tạo và quản lý workshop (thêm/sửa/xóa/hủy); phân công nhân sự check-in cho từng phòng; xem thống kê đăng ký theo thời gian thực; upload PDF tài liệu workshop; đồng bộ danh sách sinh viên từ CSV. Điều quan trọng nhất: **kiểm soát toàn bộ sự kiện từ một dashboard duy nhất**. |
| **Nhân sự check-in (Staff)** | Người quét QR tại cửa phòng sự kiện, khoảng 20–30 người | Quét mã QR sinh viên bằng mobile app; hoạt động ổn định ngay cả khi mất mạng; chặn quét nhầm QR của workshop khác; dữ liệu tự đồng bộ khi có mạng. Điều quan trọng nhất: **quét nhanh, chính xác, không phụ thuộc Internet**. |

## Phạm vi

### Thuộc phạm vi đồ án

- **Web App (React + Vite)**: Giao diện cho Sinh viên (xem lịch, đăng ký, thanh toán, xem QR) và Admin (CRUD workshop, thống kê, quản lý đồng bộ CSV, xem danh sách đăng ký).
- **Mobile App (React Native + Expo)**: Giao diện cho Staff quét QR check-in, hỗ trợ offline-first với AsyncStorage.
- **Backend API (Node.js + Express)**: Xác thực JWT + RBAC; xử lý đăng ký workshop với transaction và row-level locking; tích hợp thanh toán PayOS với Circuit Breaker; Rate Limiting (Global + User-level Sliding Window) qua Redis.
- **Background Workers (Node.js)**: Xử lý hàng đợi RabbitMQ cho các tác vụ bất đồng bộ (gửi email/app notification, sinh AI summary, đồng bộ CSV).
- **PostgreSQL**: Lưu trữ toàn bộ dữ liệu nghiệp vụ (users, workshops, registrations, payments, checkins, notifications, AI summaries, sync jobs).
- **Redis**: Cache danh sách workshop và lưu trạng thái cho Rate Limiter phân tán.
- **RabbitMQ**: Message broker điều phối các tác vụ nền.
- **Nginx**: Load balancer phân phối tải cho nhiều instance API.
- **Cloudflare Worker**: Xử lý webhook callback từ PayOS.
- **AWS S3**: Lưu trữ file CSV, ảnh workshop, tài liệu PDF (có cấu hình Presigned URL).
- **Tích hợp PayOS**: Cổng thanh toán (môi trường test/sandbox).
- **AI Model**: Tích hợp sinh tóm tắt từ PDF.
- **Docker + Docker Compose**: Container hóa toàn bộ hệ thống, hỗ trợ scale-out.

### Không thuộc phạm vi đồ án

- **Cổng thanh toán thật (production)**: Chỉ tích hợp với môi trường sandbox/test của PayOS.
- **Hạ tầng production**: Không triển khai lên AWS/GCP production, không cấu hình CI/CD pipeline đầy đủ, không có monitoring (Prometheus/Grafana), không có auto-scaling thực tế.
- **Gửi SMS / Telegram notification**: Hệ thống được thiết kế để dễ mở rộng thêm kênh (strategy pattern) nhưng hiện tại chỉ triển khai email và in-app notification.
- **Hệ thống quản lý sinh viên hai chiều**: Chỉ import dữ liệu từ CSV, không ghi ngược dữ liệu về hệ thống cũ.
- **Ứng dụng iOS/Android native**: Chỉ triển khai qua Expo (React Native).
- **Xác thực SSO / OAuth của trường**: Chỉ dùng email + password.
- **Quản lý tài chính đầy đủ**: Không có báo cáo tài chính, đối soát giao dịch, xuất hóa đơn.

## Rủi ro và ràng buộc

### 1. Tranh chấp chỗ ngồi (Race Condition)
Hai sinh viên cùng bấm nút đăng ký workshop còn đúng 1 chỗ. Nếu xử lý không đúng, cả hai đều nhận vé hoặc hệ thống ghi nhận số ghế âm.

**Biện pháp**: Sử dụng database transaction (`BEGIN...COMMIT`) kết hợp `SELECT ... FOR UPDATE` để khóa dòng workshop tại PostgreSQL, đảm bảo tuần tự hóa (serialization) các request giành chỗ cuối cùng. Kết hợp với database trigger `sync_workshop_available_seats()` và constraint `CHECK (available_seats >= 0)` để bảo vệ ở tầng cơ sở dữ liệu.

### 2. Tải trọng đột biến (Spike Traffic)
12.000 sinh viên dồn vào hệ thống trong 10 phút, 60% (7.200 người) trong 3 phút đầu — tương đương ~40 request/giây chỉ riêng cho API đăng ký, chưa kể các request xem danh sách workshop.

**Biện pháp**: 
- **Rate Limiting 2 tầng**: Global limit (toàn hệ thống tối đa N req/s cho API đăng ký) + User-level Sliding Window (mỗi user tối đa 1 req/5s) — đều triển khai trên Redis.
- **Nginx Load Balancer** phân tải cho 3 instance API (`api1`, `api2`, `api3`) trong docker-compose.
- **Redis Cache** danh sách workshop (TTL động theo thời gian sự kiện) để giảm tải database.
- Các tác vụ nặng (gửi email, xử lý AI) được đẩy qua **RabbitMQ** để API phản hồi ngay.

### 3. Cổng thanh toán không ổn định (Payment Gateway Instability)
PayOS có thể gặp sự cố (timeout, lỗi 5xx) vào đúng thời điểm cao điểm đăng ký. Nếu API chờ đợi PayOS quá lâu, toàn bộ thread Node.js bị kẹt, kéo theo các request khác cũng thất bại (cascading failure).

**Biện pháp**: 
- **Circuit Breaker** (thư viện `opossum`): Khi tỷ lệ lỗi > 50%, circuit mở — các request gọi PayOS thất bại ngay lập tức (fail-fast).
- **Graceful Degradation**: Khi circuit mở, hệ thống vẫn tạo `Registration` và giữ chỗ cho sinh viên, trả về `checkoutUrl = null` kèm thông báo thanh toán sau. Sinh viên không bị mất chỗ.
- **Idempotency Key**: Mỗi payment có `idempotency_key` UNIQUE, kết hợp `UNIQUE INDEX` trên `payments(registration_id) WHERE status = 'success'` để chống trừ tiền hai lần ngay ở tầng database.

### 4. Check-in offline (Offline-first)
Môi trường trường đại học có nhiều điểm mù Wi-Fi và sóng 4G chập chờn. Staff phải quét QR được ngay cả khi hoàn toàn mất mạng.

**Biện pháp**: 
- Mobile app lưu dữ liệu check-in vào **AsyncStorage** (bộ nhớ cục bộ của điện thoại).
- QR code chứa `workshop_id|registration_id` để app có thể validate workshop offline (chặn quét nhầm phòng).
- Cơ chế **lock state** (useRef) ngăn camera bắn nhiều request/giây cho cùng một khung hình QR.
- Background hook `useAutoSync` phát hiện có mạng (qua `expo-network`) và tự động đồng bộ hàng loạt lên server.
- **Tuyệt đối không xóa dữ liệu offline** cho đến khi nhận HTTP 201 từ server.

### 5. Tích hợp một chiều qua CSV (One-way CSV Integration)
Hệ thống quản lý sinh viên cũ **không có API**, chỉ xuất file CSV hàng đêm. File có thể lên tới hàng trăm MB, chứa dữ liệu lỗi, trùng lặp.

**Biện pháp**: 
- **Presigned URL upload**: Frontend upload trực tiếp lên AWS S3, không qua API server — tránh chiếm băng thông và thread của backend.
- **Streaming pipeline**: Worker dùng `S3 ReadStream → Node.js Stream → PostgreSQL COPY (pg-copy-streams)` để import dữ liệu vào bảng `staging_users` mà **không cần nạp vào RAM** (O(1) memory). Hỗ trợ file CSV hàng GB.
- **Staging + UPSERT**: Dữ liệu đổ vào bảng staging (không constraint), sau đó merge vào bảng `users` chính bằng `INSERT ... ON CONFLICT DO UPDATE`.
- **Cron Job ban đêm**: Cho phép lên lịch đồng bộ vào 2h sáng (`SYNC_CRON_SCHEDULE`) để tránh ảnh hưởng đến giờ cao điểm.
- **RabbitMQ với prefetch(1)**: Mỗi worker chỉ xử lý 1 file CSV tại một thời điểm, tránh OOM.

### 6. Độ phức tạp kiến trúc (Architecture Complexity)
Hệ thống bao gồm 7+ dịch vụ (Nginx, API × 3, Worker, PostgreSQL, Redis, RabbitMQ, Cloudflare Worker) đòi hỏi khả năng vận hành và debug cross-container.

**Biện pháp**: Docker Compose đóng gói toàn bộ hạ tầng, khởi chạy bằng một lệnh duy nhất. Seed data có sẵn để kiểm thử nhanh. README hướng dẫn chi tiết từng bước.

# Đặc tả: Đồng bộ sinh viên từ file CSV

## Mô tả
Chức năng dành cho Admin nhập đồng loạt ngàn bản ghi sinh viên mà không làm downtime Node.js hay tiêu thụ RAM.
Sử dụng Message Queue (RabbitMQ) và Streaming Pipe (pg-copy-streams) từ AWS S3 vào Bảng tạm PostgreSQL, sau cùng là thao tác MERGE xử lý tự động trong CSDL.

## Luồng chính
1. **Khởi tạo Job Sync (createSyncJob):** POST /users/sync chứa fileKey và cờ isImmediate. Controller ghi task INSERT INTO sync_jobs trạng thái Pending.
2. **Push hàng đợi RabbitMQ (userSync.producer):** 
   - isImmediate = true, gọi hàm publishUserSyncJob.
   - isImmediate = false, chờ node-cron dùng biến SYNC_CRON_SCHEDULE.
3. **Worker Stream xử lý (userSync.worker.js):**
   - channel.consume. Update trạng thái Job thành Processing. prefetch(1).
   - Readable stream S3 bằng getS3ReadStream(fileKey).
4. **Stream Database Pipe (COPY FROM STDIN):** 
   - TRUNCATE staging_users.
   - Mở Ingest stream COPY staging_users (student_code, name, email) FROM STDIN WITH (FORMAT csv, HEADER true).
   - readStream.pipe(ingestStream).
5. **Cập nhật chính MERGE UPSERT (mergeStagingUsersIntoMain):** 
   - SQL Code: INSERT INTO users (...) SELECT ... FROM staging_users WHERE student_code IS NOT NULL ON CONFLICT (student_code) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email.
   - Password auto: student_code || '#' || split_part(email, '@', 1).
6. **Xác nhận hoàn thành:** Update Completed. Gọi channel.ack(msg).

## Kịch bản lỗi
- **Thiếu Header/S3 Crash:** Catch lỗi, update Failed và gọi channel.ack(msg).
- **Worker Die:** RabbitMQ giữ lại Message, Re-run sau vì TRUNCATE ở Staging đảm bảo Idempotent.

## Ràng buộc
- O(1) Memory Space.
- student_code UNIQUE. 

## Tiêu chí chấp nhận
- Upload File > 200,000 dòng không ăn RAM.
- Cập nhật đúng đắn dữ liệu: Đã tồn tại mã số sinh viên tự viết đè.

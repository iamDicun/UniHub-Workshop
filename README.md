# UniHub Workshop - Sổ tay Vận hành & Quy trình Phát triển (Sprint 0)

Tài liệu này hướng dẫn chi tiết cách thiết lập môi trường, quy trình code, kiểm thử và triển khai tự động cho dự án UniHub Workshop.

---

## 1. Chuẩn bị Hạ tầng (Setup)

### A. Dành cho tất cả thành viên (Cài đặt máy cá nhân)
Mọi thành viên trong nhóm cần cài đặt các công cụ sau:
1.  **Docker Desktop:** Để chạy hạ tầng ảo (DB, Redis, RabbitMQ).
2.  **Node.js (LTS 18.x hoặc 20.x):** Môi trường chạy code.
3.  **Git:** Quản lý mã nguồn.
4.  **VS Code Extensions:** Cài đặt `ESLint` và `Prettier` để tự động dọn dẹp code.

### B. Dành riêng cho Leader (Đăng ký dịch vụ)
Leader cần chuẩn bị các tài khoản sau và nắm quyền Admin:
1.  **GitHub:** Tạo Repository và thêm các thành viên làm Collaborators.
2.  **Supabase:** Tạo project để lấy `DATABASE_URL` (PostgreSQL).
3.  **Oracle Cloud:** Đăng ký VPS ARM (Gói Free Tier 24GB RAM) để làm máy chủ chạy thật.
4.  **Cloudflare:** Tạo tài khoản để quản lý DNS và bật bảo mật WAF.
5.  **GitHub Student Pack:** Đăng ký bằng email trường để lấy Tên miền (Domain) miễn phí.

---

## 2. Phân tách Môi trường (Dev vs. Prod)

Hệ thống được chia làm 2 file cấu hình Docker để tối ưu tốc độ code và độ an toàn khi chạy thật.

### Môi trường Dev (`docker-compose.dev.yml`)
* **Mục tiêu:** Giúp thành viên có ngay DB để code mà không cần cài đặt rườm rà.
* **Thành phần:** Redis, RabbitMQ. (Dữ liệu PostgreSQL sẽ kết nối thẳng tới Supabase hoặc chạy Docker Postgres tùy chọn).
* **Lệnh chạy:** `docker-compose -f docker-compose.dev.yml up -d`
* **Luồng code:** Chạy Node.js trực tiếp trên máy thật bằng lệnh `npm run dev` để hỗ trợ hot-reload (sửa code là thấy kết quả ngay).

### Môi trường Prod (`docker-compose.prod.yml`)
* **Mục tiêu:** Đóng gói toàn bộ hệ thống để chạy trên VPS Oracle.
* **Thành phần:** Nginx (Load Balancer), Node.js API (3-4 instances), Redis, RabbitMQ.
* **Lệnh chạy (Máy chủ tự gọi):** `docker-compose -f docker-compose.prod.yml up -d --build`
* **Bảo mật:** Đóng kín toàn bộ cổng DB/Redis, chỉ mở cổng 80/443 của Nginx.

---

## 3. Quy trình làm việc (Workflow) của Thành viên

Mọi thành viên phải tuân thủ trình tự 6 bước sau:

1.  **Lấy code:** `git pull origin main` và tạo nhánh tính năng `git checkout -b feature/ten-tinh-nang`.
2.  **Bật hạ tầng:** `docker-compose -f docker-compose.dev.yml up -d`.
3.  **Viết code & Test:**
    * Viết logic xử lý (Controller/Service).
    * Viết file kiểm thử tương ứng trong thư mục `tests/` bằng **Jest** và **Supertest**.
4.  **Commit (Husky kiểm soát):**
    * Gõ `git commit -m "mô tả"`.
    * **Husky** sẽ tự động chạy ESLint. Nếu code xấu hoặc có lỗi, lệnh commit sẽ bị hủy.
5.  **Tạo Pull Request (CI):**
    * Push code lên GitHub và tạo Pull Request.
    * **GitHub Actions** tự động dựng máy ảo, chạy `npm test`. Nếu xanh (Pass), Leader mới được phép Merge.
6.  **Deploy (CD):**
    * Sau khi Merge vào `main`, GitHub Actions tự động kết nối VPS Oracle qua SSH.
    * VPS tự động kéo code mới và restart hệ thống qua Docker Compose.

---

# CI/CD cho mô hình deploy hiện tại

Mô hình hiện tại nên tách như sau:

* Web frontend deploy lên Vercel.
* Backend deploy lên EC2 bằng Docker.
* EC2 dùng Elastic IP để giữ địa chỉ tĩnh.
* Cloudflare đứng trước API domain để ẩn origin IP và giảm rủi ro DDoS.
* Upload file lên S3 dùng presigned URL, nên phải cấu hình CORS theo domain Vercel.

---

## 1. Web frontend trên Vercel

Mục tiêu của phần web là để Vercel tự build và deploy khi push lên `main`.

Checklist:

* [ ] Kết nối GitHub repo vào Vercel.
* [ ] Chọn root directory là `source/web`.
* [ ] Build command: `npm run build`.
* [ ] Output directory: `dist`.
* [ ] Thêm biến môi trường `VITE_API_BASE_URL` trỏ về API public domain.
* [ ] Dùng preview deployment cho pull request.

Giá trị env nên dùng dạng:

```text
VITE_API_BASE_URL=https://api.your-domain.com/api
```

Trong code web, client đã đọc biến này tại [source/web/src/api/client.js](source/web/src/api/client.js#L5), nên nếu chưa set thì web sẽ fallback về `/api`.

---

## 2. Backend trên EC2

Backend nên deploy bằng Docker Compose trên EC2.

Checklist:

* [ ] Tạo workflow test/lint cho `source/api`.
* [ ] Build Docker image của API để kiểm tra image production.
* [ ] Khi merge vào `main`, SSH vào EC2 và chạy `git pull`.
* [ ] Chạy `docker compose up -d --build` trên server để cập nhật API.
* [ ] Giữ các secret deploy cho EC2: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`.

Nếu bạn muốn đơn giản hơn, Vercel sẽ lo toàn bộ phần web, còn workflow backend chỉ cần kiểm tra API và deploy sang EC2.

---

## 3. Mobile app

Phần mobile có thể build riêng bằng Expo/EAS.

Checklist:

* [ ] Build APK/AAB bằng Expo EAS.
* [ ] Thêm secret `EXPO_TOKEN`.
* [ ] Set `EXPO_PUBLIC_API_URL` trỏ về API domain public.

---

## 4. S3 CORS cho upload từ web Vercel

Do browser upload lên S3 bằng presigned URL, bucket S3 phải cho phép origin của Vercel.

Checklist:

* [ ] Thêm origin production của Vercel.
* [ ] Thêm origin preview nếu bạn hay test preview deployment.
* [ ] Cho phép `GET`, `PUT`, `POST`, `HEAD`.
* [ ] Cho phép headers `*`.

Ví dụ CORS rule:

```json
[
  {
    "AllowedOrigins": [
      "https://your-project.vercel.app",
      "https://your-custom-domain.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Nếu bạn dùng nhiều preview domain của Vercel, hãy thêm cả pattern hoặc thêm từng domain preview thực tế mà team đang dùng.

---

## 5. Cloudflare trước API

Cloudflare chỉ proxy theo domain, không proxy trực tiếp bằng IP trần.

Checklist:

* [ ] Tạo domain như `api.your-domain.com`.
* [ ] Tạo A record trỏ về Elastic IP của EC2.
* [ ] Bật proxy của Cloudflare cho record này.
* [ ] Chỉ mở port 80/443 ra Internet nếu cần, sau đó nên giới hạn nguồn truy cập bằng Cloudflare IP ranges.
* [ ] Nếu dùng HTTPS, cài TLS ở Cloudflare hoặc origin EC2 tùy mô hình bạn chọn.

Mục tiêu của phần này là để người dùng chỉ thấy domain Cloudflare, còn IP thật của EC2 được che phía sau.

---

## 6. AWS secrets và env

Checklist env tối thiểu cho backend:

* [ ] `DATABASE_URL`
* [ ] `JWT_SECRET`
* [ ] `REDIS_URL`
* [ ] `RABBITMQ_URL`
* [ ] `PAYOS_CLIENT_ID`
* [ ] `PAYOS_API_KEY`
* [ ] `PAYOS_CHECKSUM_KEY`
* [ ] `PAYOS_RETURN_URL`
* [ ] `PAYOS_CANCEL_URL`

Env tuỳ chọn theo tính năng:

* [ ] `MAIL_USER`
* [ ] `MAIL_PASS`
* [ ] `AWS_ACCESS_KEY_ID`
* [ ] `AWS_SECRET_ACCESS_KEY`
* [ ] `AWS_REGION`
* [ ] `S3_BUCKET_NAME`
* [ ] `CDN_BASE_URL`
* [ ] `DEEPSEEK_API_KEY`
* [ ] `DEEPSEEK_BASE_URL`
* [ ] `CACHE_WORKSHOP_NEW_DURATION`
* [ ] `CACHE_WORKSHOP_EVENT_WINDOW`
* [ ] `SYNC_CRON_SCHEDULE`

---

## 7. Workflow khuyến nghị

Luồng deploy hợp lý nhất cho repo này:

```text
push main
   ↓
GitHub Actions chạy lint/test API
   ↓
Web tự deploy trên Vercel
   ↓
Backend SSH vào EC2
   ↓
git pull
docker compose up -d --build
```

Nếu bạn vẫn muốn giữ GitHub Actions cho web, workflow đó chỉ nên làm bước kiểm tra build, không cần deploy image Docker nữa khi web đã ở Vercel.

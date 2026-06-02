# Deploy Hướng Dẫn

Mô hình deploy hiện tại:

```text
Web -> Vercel
API -> EC2 Ubuntu + Elastic IP
DNS / WAF -> Cloudflare
Storage -> S3
Cache / Queue -> Redis, RabbitMQ
```

Mục tiêu của tài liệu này là hướng dẫn từng bước triển khai thực tế, từ chuẩn bị hạ tầng đến cách tắt mở server khi không dùng.

## Bước 1. Tạo EC2 và gán IP tĩnh

1. Vào AWS EC2 Console.
1. Tạo instance Ubuntu 22.04.
1. Chọn instance type phù hợp, ưu tiên `t3.small` nếu bạn muốn chạy ổn định hơn, hoặc `t3.micro` nếu muốn tiết kiệm.
1. Tạo key pair và tải file `.pem` về máy.
1. Lưu file `.pem` ở nơi an toàn, không đẩy lên Git.
1. Tạo Security Group chỉ mở các port cần thiết:
1. Mở `22` cho SSH.
1. Mở `80` cho HTTP.
1. Mở `443` nếu sau này bạn bật HTTPS ở origin.
1. Không mở `6379`, `5672`, `5432` ra Internet.
1. Sau khi instance chạy xong, allocate Elastic IP.
1. Attach Elastic IP vào EC2 để địa chỉ không đổi sau khi stop/start.

Kết quả cần đạt ở bước này là bạn có 1 EC2 với 1 địa chỉ IP tĩnh làm origin cho backend.

## Bước 2. Trỏ domain qua Cloudflare

1. Add domain của bạn vào Cloudflare.
1. Tạo `A record` cho API, ví dụ `api.yourdomain.com`.
1. Trỏ `A record` đó về Elastic IP của EC2.
1. Bật proxy của Cloudflare cho record đó để ẩn origin IP.
1. Nếu cần chống DDoS tốt hơn, chỉ cho phép IP range của Cloudflare vào Security Group của EC2.
1. Nếu muốn dùng `Full (strict)`, tạo Cloudflare Origin Certificate cho `api.yourdomain.com` và cài lên EC2.
1. Đặt file cert và key vào thư mục `source/certs/` trên EC2 với tên `origin.crt` và `origin.key`.
1. Nếu chưa cài cert origin thì chỉ dùng tạm `Full`, không dùng `Full (strict)`.

Kết quả cần đạt là người dùng chỉ truy cập qua domain, không truy cập trực tiếp vào IP thô.

## Bước 3. SSH vào EC2

1. Mở terminal trên máy local.
1. Dùng lệnh SSH sau:

```bash
ssh -i your-key.pem ubuntu@YOUR_ELASTIC_IP
```

Nếu đây là lần đầu kết nối, gõ `yes` khi được hỏi xác nhận fingerprint.

## Bước 4. Cài Docker và Git trên EC2

1. Cập nhật hệ thống:

```bash
sudo apt update && sudo apt upgrade -y
```

1. Cài Docker:

```bash
curl -fsSL https://get.docker.com | sh
```

1. Cài Docker Compose plugin và Git:

```bash
sudo apt install docker-compose-plugin git -y
```

1. Thêm user hiện tại vào group Docker:

```bash
sudo usermod -aG docker $USER
```

1. Logout rồi login lại để quyền Docker có hiệu lực.
1. Kiểm tra cài đặt:

```bash
docker --version
docker compose version
git --version
```

1. Tạo thư mục chứa cert cho Nginx:

```bash
mkdir -p ~/UniHub-Workshop/source/certs
```

## Bước 5. Clone source backend

1. Clone repo về EC2:

```bash
git clone YOUR_REPO_URL
```

1. Chuyển vào thư mục source:

```bash
cd UniHub-Workshop/source
```

## Bước 6. Tạo file môi trường production

1. Tạo file `.env.production` trong thư mục `source/`.
1. Khai báo tối thiểu các biến sau:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=...
JWT_SECRET=...
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://rabbitmq:5672
PAYOS_CLIENT_ID=...
PAYOS_API_KEY=...
PAYOS_CHECKSUM_KEY=...
PAYOS_RETURN_URL=https://your-vercel-domain.vercel.app/student/payments
PAYOS_CANCEL_URL=https://your-vercel-domain.vercel.app/student/payments
```

1. Nếu hệ thống của bạn dùng thêm email, S3, AI hoặc cache thì thêm các biến tuỳ chọn:

```env
MAIL_USER=...
MAIL_PASS=...
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
CDN_BASE_URL=https://your-cdn-domain
DEEPSEEK_API_KEY=...
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
CACHE_WORKSHOP_NEW_DURATION=...
CACHE_WORKSHOP_EVENT_WINDOW=...
SYNC_CRON_SCHEDULE=...
```

Kết quả cần đạt là backend đọc được env production ngay khi container chạy.

## Bước 7. Chạy backend production

1. Trong thư mục `source/`, chạy compose production:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

1. Nếu bạn đang dùng Cloudflare `Full strict`, đảm bảo có đủ 2 file sau trên EC2:

```bash
~/UniHub-Workshop/source/certs/origin.crt
~/UniHub-Workshop/source/certs/origin.key
```

1. Nếu chưa có cert, hãy cài xong cert rồi mới bật `Full strict`, nếu không Nginx sẽ không lên được.

1. Kiểm tra container đã lên chưa:

```bash
docker compose -f docker-compose.prod.yml ps
```

1. Xem log nếu có lỗi:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

Kết quả cần đạt là API chạy ổn trên EC2 và Nginx public ra ngoài qua port 80 lẫn 443.

## Bước 8. Deploy web lên Vercel

1. Vào Vercel và import thư mục `source/web`.
1. Build command để mặc định là `npm run build`.
1. Output directory là `dist`.
1. Thêm biến môi trường trên Vercel:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

1. Deploy lần đầu để Vercel sinh domain production.
1. Kiểm tra web gọi đúng API domain mới.

Kết quả cần đạt là web chạy trên Vercel và gọi API qua domain Cloudflare.

## Bước 9. Cấu hình CORS cho S3

1. Vào S3 bucket đang dùng cho upload file.
1. Mở phần CORS configuration.
1. Thêm origin của Vercel production.
1. Nếu có preview deployment, thêm cả preview origin bạn đang dùng.
1. Dùng rule mẫu sau:

```json
[
  {
    "AllowedOrigins": [
      "https://your-project.vercel.app",
      "https://your-custom-domain.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Kết quả cần đạt là browser trên Vercel upload hoặc tải file từ S3 mà không bị block CORS.

## Bước 10. Kiểm tra toàn bộ luồng chạy

1. Mở web trên Vercel.
1. Đăng nhập thử.
1. Gọi thử API qua domain `https://api.yourdomain.com`.
1. Kiểm tra upload file nếu ứng dụng có dùng S3.
1. Kiểm tra payment flow nếu có PayOS.
1. Kiểm tra log backend trên EC2 khi có request.

Kết quả cần đạt là web, API, S3 và Cloudflare đều kết nối được với nhau qua domain đúng.

## Bước 11. Tắt server thủ công khi không dùng

1. Vào AWS EC2 Console.
1. Chọn instance đang chạy.
1. Chọn `Instance state -> Stop instance`.
1. Khi stop, bạn sẽ ngưng phí compute của EC2.
1. Lưu ý EBS volume vẫn còn phí lưu trữ.
1. Nếu bạn giải phóng Elastic IP thì có thể phát sinh phí cho IP không gắn.

## Bước 12. Bật lại server khi cần dùng

1. Vào AWS EC2 Console.
1. Chọn instance.
1. Chọn `Start instance`.
1. Vì đã gán Elastic IP nên địa chỉ không đổi.
1. SSH vào lại EC2.
1. Chạy lại compose:

```bash
cd UniHub-Workshop/source
docker compose -f docker-compose.prod.yml up -d
```

Kết quả cần đạt là server bật lại đơn giản, không phải cấu hình lại IP hay domain.

## Bước 13. Tóm tắt luồng deploy

```text
1. Setup EC2 + Elastic IP
2. Trỏ domain qua Cloudflare
3. SSH vào EC2
4. Cài Docker
5. Clone repo
6. Tạo .env.production
7. docker compose up -d --build
8. Deploy web lên Vercel
9. Cấu hình S3 CORS
10. Stop/Start EC2 khi cần
```

# UniHub Workshop — Hướng dẫn khởi chạy

## Yêu cầu

- **Docker Desktop** (bật và đang chạy)
- **Node.js 20+** (chỉ cần nếu chạy mobile app local)

---

## 🚀 Khởi chạy hệ thống (Web + API + Infrastructure)

```bash
cd source/
docker-compose up --build
```

### Chạy dev server cho API và Web

Mở 2 terminal riêng:

```bash
cd source/api
npm install
npm run dev
```

```bash
cd source/web
npm install
npm run dev
```

| Dịch vụ | URL |
|---------|-----|
| Web App (Student/Admin) | http://localhost |
| API Backend | http://localhost/api |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |
| Redis | localhost:6379 |

> Database: Supabase (đã cấu hình sẵn trong .env)

---

## 📱 Mobile App (file tải sẵn)

Tải app qua Google Drive:

https://drive.google.com/file/d/1x2DcXRxL3Ge0O22MfJiXwPrtU0G9TPhM/view?usp=sharing

---

### Tài khoản mẫu

| Email | Mật khẩu | Vai trò |
|-------|----------|---------|
| admin@unihub.edu.vn | 123456 | Admin |
| buicuong7954@gmail.com | 123456 | Sinh viên |
| staff@unihub.edu.vn | 123456 | Nhân sự check-in |

---

## 📱 Mobile App (QR Check-in)

### Yêu cầu
- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app trên điện thoại (iOS/Android)

### Cài đặt và chạy

```bash
cd source/app
npm install
npm start    # Hiện QR code → scan bằng Expo Go
```

### Cấu hình API URL cho mobile

Mở file `source/app/.env`:
```
# Thay localhost bằng IP máy tính của bạn trong mạng LAN
EXPO_PUBLIC_API_URL=http://192.168.x.x/api
```

> Tìm IP: `ipconfig` (Windows) → IPv4 Address

---

## 🛑 Dừng hệ thống

```bash
docker-compose down
# Xóa cả volumes (database local nếu có):
docker-compose down -v
```

---

## 🧪 Test PayOS webhook bằng Postman

Endpoint (dùng chung cho webhook thật và test):

```
POST http://localhost/api/payments/webhook
```

Header để bật test mode:

```
x-webhook-test: 1
```

Body mẫu:

```json
{
	"testMode": true,
	"code": "00",
	"orderCode": 123
}
```

Ghi chú:
- `orderCode` phải trùng với một payment đã tồn tại trong database.
- Bạn có thể lấy `orderCode` từ response đăng ký workshop hoặc từ trang Lịch sử thanh toán.

---

## Cấu trúc thư mục

```
source/
├── api/        # Backend Node.js Express
├── web/        # Frontend React + Vite
├── app/        # Mobile App React Native (Expo)
├── config/     # Nginx config
├── .docker/    # Dockerfiles
├── .env        # Biến môi trường (đã cấu hình)
└── docker-compose.yml
```

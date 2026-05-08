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

| Dịch vụ | URL |
|---------|-----|
| Web App (Student/Admin) | http://localhost |
| API Backend | http://localhost/api |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |
| Redis | localhost:6379 |

> Database: Supabase (đã cấu hình sẵn trong .env)

---

## 🌱 Seed dữ liệu mẫu

Chạy sau khi `docker-compose up` thành công:

```bash
# Cách 1: Từ container (thay api1 bằng tên container thực tế)
docker exec -it source-api1-1 node scripts/seed.js

# Cách 2: Chạy local (yêu cầu Node.js và .env đúng)
cd source/api
node --env-file=../.env scripts/seed.js
```

### Tài khoản mẫu sau khi seed:

| Email | Mật khẩu | Vai trò |
|-------|----------|---------|
| admin@unihub.edu.vn | password123 | Admin |
| student1@student.edu.vn | password123 | Sinh viên |
| staff1@unihub.edu.vn | password123 | Nhân sự check-in |

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

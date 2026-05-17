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

## 📱 Hướng dẫn Deploy Mobile App (QR Check-in) lên Điện thoại

Để chạy được App quét QR trên điện thoại thật của bạn, hãy làm đúng theo các bước sau:

### 1. Chuẩn bị mạng và Tường lửa
- **Mạng Wifi:** Đảm bảo Điện thoại và Máy tính (chạy Docker/Backend) phải kết nối chung vào **cùng một mạng Wifi**.
- **Tường lửa (Firewall):** Tắt tạm thời Windows Defender Firewall hoặc đảm bảo đã cấp quyền (Allow) cho Node.js và cổng 80, 3000, 19000 đi qua tường lửa.

### 2. Cấu hình IP Máy tính
- Mở Terminal/CMD gõ `ipconfig` (Windows) hoặc `ifconfig` (Mac/Linux) để lấy địa chỉ **IPv4 Address** (ví dụ: `192.168.1.7`).
- Vào thư mục `source/app/`, tạo file `.env` (nếu chưa có) và dán nội dung sau:
  ```env
  EXPO_PUBLIC_API_URL=http://<IP_MÁY_TÍNH_CỦA_BẠN>/api
  ```
  *(Thay `<IP_MÁY_TÍNH_CỦA_BẠN>` bằng số IP vừa lấy)*

### 3. Khởi chạy App
- Đảm bảo bạn đã cài ứng dụng **Expo Go** trên điện thoại (tải từ App Store hoặc Google Play).
- Mở terminal tại thư mục gốc của project:
  ```bash
  cd source/app
  npm install
  npm start
  ```

### 4. Kết nối Điện thoại
1. Khi terminal (hoặc trình duyệt) hiện lên một mã QR lớn.
2. Dùng Camera của điện thoại (với iOS) hoặc mở app Expo Go lên chọn "Scan QR Code" (với Android) để quét mã này.
3. **⚠️ QUAN TRỌNG:** Khi màn hình điện thoại hiện lên yêu cầu đăng nhập, bạn **phải chọn nút "Proceed anonymously"** (Tiếp tục ẩn danh) ở dưới cùng. App sẽ lập tức tải bundle và khởi chạy!

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

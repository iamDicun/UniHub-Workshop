# ĐỒ ÁN MÔN HỌC – UniHub Workshop

## Bối cảnh

Trường Đại học A tổ chức **“Tuần lễ kỹ năng và nghề nghiệp”** hàng năm.  
Sự kiện kéo dài 5 ngày, mỗi ngày có 8–12 workshop diễn ra song song tại nhiều phòng khác nhau.

Hiện tại ban tổ chức quản lý đăng ký bằng Google Form và thông báo qua email thủ công — quy trình này không còn đáp ứng được nhu cầu khi quy mô ngày càng lớn.

Ban tổ chức muốn xây dựng hệ thống **UniHub Workshop** để số hóa toàn bộ quy trình, từ đăng ký đến check-in tại sự kiện.

---

## Người dùng

| Nhóm | Mô tả |
|---|---|
| Sinh viên | Xem lịch workshop, đăng ký, nhận xác nhận, check-in khi tham dự |
| Ban tổ chức | Tạo và quản lý workshop, theo dõi số lượng đăng ký |
| Nhân sự check-in | Xác nhận sinh viên tham dự tại cửa phòng bằng mobile app |

---

## Yêu cầu hệ thống

### Xem và đăng ký workshop

Sinh viên xem danh sách workshop trong tuần lễ, bao gồm:
- Diễn giả
- Phòng tổ chức
- Sơ đồ phòng
- Số chỗ còn lại theo thời gian thực

Sau khi đăng ký thành công, sinh viên nhận **mã QR** dùng để check-in.

---

### Thông báo

Sau khi đăng ký:
- Nhận thông báo qua app
- Nhận email xác nhận

Hệ thống phải dễ mở rộng thêm kênh thông báo mới (ví dụ Telegram).

---

### Quản trị

Trang admin nội bộ cho ban tổ chức:

- Tạo workshop
- Cập nhật thông tin
- Đổi phòng / đổi giờ
- Hủy workshop
- Xem thống kê

Phân quyền:

- Sinh viên → xem + đăng ký
- Ban tổ chức → toàn quyền workshop
- Nhân sự check-in → chỉ quét QR

---

### Check-in tại sự kiện

Mobile app cho nhân sự:

- Quét QR sinh viên
- Hoạt động khi **mất mạng**
- Lưu check-in tạm
- Tự đồng bộ khi có mạng lại

---

### AI Summary

Ban tổ chức upload PDF giới thiệu workshop.

Hệ thống:
1. Parse PDF  
2. Làm sạch văn bản  
3. Gửi sang AI model  
4. Sinh bản tóm tắt hiển thị trên trang workshop

---

### Đồng bộ dữ liệu sinh viên

Hệ thống cũ **không có API**.

Chỉ có:
- File CSV export ban đêm

UniHub cần:
- Import định kỳ
- Xử lý file lỗi
- Loại dữ liệu trùng
- Không làm gián đoạn hệ thống đang chạy

---

## Các vấn đề cần giải quyết

### Tranh chấp chỗ ngồi

Workshop 60 chỗ nhưng hàng trăm sinh viên đăng ký cùng lúc.

Yêu cầu:
- Không có hai sinh viên cùng nhận chỗ cuối.

---

### Tải trọng đột biến

Dự kiến:
- 12.000 sinh viên truy cập trong 10 phút
- 60% dồn vào 3 phút đầu

Hệ thống phải:
- Bảo vệ backend API
- Ngăn spam request
- Đảm bảo công bằng

---

### Thanh toán không ổn định

Nếu payment gateway lỗi:

- Vẫn xem được lịch workshop
- Không trừ tiền hai lần
- Hệ thống khác vẫn hoạt động

---

### Check-in offline

- Check-in khi mất mạng
- Không mất dữ liệu
- Đồng bộ lại sau

---

### Tích hợp một chiều

Chỉ đọc CSV export.

Luồng import phải:
- Chịu được file lỗi
- Xử lý duplicate
- Không downtime

---

# Các nội dung cần thực hiện

## Phần 1 — Blueprint

### 1. Tài liệu thiết kế hệ thống

Mô tả:
- Các thành phần hệ thống
- Cách giao tiếp
- Ảnh hưởng khi một phần gặp sự cố

---

### 2. C4 Diagram

#### Level 1 — System Context
- Actors
- Hệ thống ngoài tích hợp

#### Level 2 — Container
Ví dụ:
- Web App
- Mobile App
- Backend API
- Database
- Message Broker

---

### 3. High-Level Architecture Diagram

Thể hiện:
- Luồng dữ liệu
- Dependency
- Integration points:
  - Legacy system
  - Payment gateway
  - AI model
  - Offline check-in

---

### 4. Thiết kế cơ sở dữ liệu

- Xác định loại dữ liệu
- Chọn SQL / NoSQL / Hybrid
- Thiết kế schema entity chính

---

### 5. Luồng nghiệp vụ quan trọng

Chọn ít nhất **2 luồng**:

- Đăng ký workshop có phí
- Check-in offline + sync
- Import CSV ban đêm

Mô tả:
- Các bước xử lý
- Thành phần tham gia
- Cách xử lý lỗi

---

### 6. Thiết kế kiểm soát truy cập

Thiết kế phân quyền:

- Role
- Permission
- Kiểm tra tại:
  - API
  - Admin
  - Mobile app

Có thể dùng:
- RBAC

---

### 7. Cơ chế bảo vệ hệ thống

#### Kiểm soát tải đột biến
Ví dụ:
- Rate Limiting
  - Fixed Window
  - Sliding Window
  - Token Bucket
  - Leaky Bucket

#### Payment gateway lỗi
- Circuit Breaker
- Graceful Degradation

#### Chống trừ tiền hai lần
- Idempotency Key
  - Sinh key
  - Lưu trữ
  - Kiểm tra trùng
  - TTL

---

## Phần 2 — Cài đặt

### Phần mềm hoàn chỉnh

Bao gồm:

- Tất cả tính năng nghiệp vụ
- Cơ chế kỹ thuật thật (không mock)
- README chạy được ngay
- Seed data

---

## Tham khảo Template Blueprint

```
blueprint/
├── proposal.md
├── design.md
└── specs/
    ├── auth.md
    ├── payment.md
    ├── checkin.md
    └── ...
```

---

### proposal.md

```md
# UniHub Workshop — Project Proposal

## Vấn đề
Mô tả vấn đề hiện tại.

## Mục tiêu
Ví dụ: hỗ trợ 12.000 sinh viên đăng ký trong 10 phút.

## Người dùng và nhu cầu
Ai dùng? Họ cần gì?

## Phạm vi
Trong phạm vi / ngoài phạm vi.

## Rủi ro và ràng buộc
Seat race, spike traffic, payment lỗi, offline check-in, CSV integration.
```

---

### design.md

```md
# UniHub Workshop — Technical Design

## Kiến trúc tổng thể
Mô tả architectural style và lý do.

## C4 Diagram

### Level 1 — System Context

### Level 2 — Container
```
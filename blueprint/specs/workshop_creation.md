# Đặc tả: Tạo mới Workshop

## Mô tả
Chức năng cho phép người dùng có quyền Quản trị viên (Admin) tạo một Workshop mới thông qua API POST /api/workshops/.
Thông tin được lưu trữ vào bảng workshops trong cơ sở dữ liệu PostgreSQL. Nếu Admin cung cấp danh sách email của nhân sự hỗ trợ (staff_emails), hệ thống sẽ phân giải, tìm kiếm các User hợp lệ mang quyền staff và liên kết với Workshop thông qua bảng trung gian workshop_staffs.
Sau khi cập nhật cơ sở dữ liệu hoàn thành, hệ thống thực hiện thao tác lưu đối tượng hoàn chỉnh vào bộ nhớ đệm Redis (Write-through cache) thông qua setCachedWorkshop để tối ưu hóa truy xuất, giảm tải Data Read.

## Luồng chính
1. **Kiểm tra quyền truy cập:** Hệ thống sử dụng middleware protect và Authorize('admin') để xác thực người gọi API phải đã đăng nhập hợp lệ và mang vai trò admin.
2. **Kiểm tra tính hợp lệ của dữ liệu (Validation):** createWorkshop service kiểm tra 
eq.body:
   - 	itle: Không được bỏ trống.
   - capacity: Bắt buộc điền, kiểu số nguyên, phải lớn hơn 0 (parseInteger).
   - price: Mặc định bằng 0 nếu không truyền hoặc truyền rỗng; còn nếu có truyền phải parse ra số thứ tự, hợp lệ (parseNumber).
   - start_time và end_time: Chuyển đổi định dạng ISO bắt buộc (parseDate). Kiểm tra đảm bảo start_time phải có trước end_time.
3. **Lưu CSDL (createWorkshopRepo):**
   - Insert vào PostgreSQL bảng workshops: 	itle, description, capacity, Available_seats (cùng giá trị capacity), price, start_time, end_time, location, speaker, 
oom_map_url, created_by (ID nhận từ 
eq.user.id).
   - Lệnh Database trả về Object bằng cú pháp RETURNING.
4. **Đồng bộ hóa mảng Nhân sự (syncWorkshopStaff):**
   - Nếu staff_emails có thiết lập, mã được cắt mảng split theo dấu phẩy, trim và filter bảo vệ.
   - SQL DELETE FROM workshop_staffs WHERE workshop_id =  thực hiện xóa bảo tồn toàn bộ hàng thuộc về workshop_id đó.
   - SQL SELECT id FROM users WHERE email = ANY() AND role = 'staff' gọi ra mảng các Account đáp ứng làm Nhân sự.
   - Lặp vòng lặp for...of để thực hiện INSERT INTO workshop_staffs (workshop_id, staff_id) VALUES (, ) ON CONFLICT DO NOTHING.
   - Tiến hành Fetch lại thông tin getWorkshopById để lấy phiên bản entity Data đã cập nhật nhân sự hoàn chỉnh nhất.
5. **Ghi đè Cache (Redis Caching Cache):** Đẩy kết quả lấy được lên cache memory thông qua hàm setCachedWorkshop.
6. **Xác nhận kết quả:** Trả về đối tượng JSON workshop vừa tạo ở HTTP 201.

## Kịch bản lỗi
- **Dữ liệu không hợp logic:** Cú pháp trả về bằng hàm throw Helper: BuildError(message, 400). API hủy thực thi ngay.
- **Giá trị Email lạ:** Khi có email lỗi, query 
ole = 'staff' sẽ bỏ qua phần tử, các thành phần đạt chứng nhận vẫn sẽ Insert như thường (Fail-safe operation).
- **Lỗi hệ thống:** PostgreSQL/Redis throw Error, server quăng code 500.

## Ràng buộc
- Hiệu năng syncWorkshopStaff O(N).
- Chưa đóng gói luồng tạo Workshop vào BEGIN-COMMIT.

## Tiêu chí chấp nhận
- Gọi API với Input đúng, trả về 201 Http Status.
- Lỗi 400 Error cho Check validation như start_time sau end_time.
- Trả về Cache Redis khớp.

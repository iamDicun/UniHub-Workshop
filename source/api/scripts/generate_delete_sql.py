import csv
import os

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Đọc từ file danh sách cập nhật (chứa cả user cũ và user mới thêm vào)
    csv_path = os.path.join(script_dir, 'mock_users_updated.csv')
    sql_path = os.path.join(script_dir, 'delete_mock_users.sql')

    if not os.path.exists(csv_path):
        # Nếu chưa có file updated, dùng file base
        csv_path = os.path.join(script_dir, 'mock_users.csv')
        if not os.path.exists(csv_path):
            print(f"Lỗi: Không tìm thấy cả mock_users_updated.csv và mock_users.csv")
            return

    student_codes = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if 'student_code' in row:
                student_codes.append(row['student_code'])

    if not student_codes:
        print("Không có sinh viên nào để xóa.")
        return

    # Tạo câu lệnh SQL
    codes_str = ", ".join(f"'{code}'" for code in student_codes)
    sql_content = f"DELETE FROM users WHERE student_code IN ({codes_str});\n"

    # Ghi ra file
    with open(sql_path, 'w', encoding='utf-8') as f:
        f.write(sql_content)

    print("--- Đã tạo file SQL xóa user thành công ---")
    print(f"Sử dụng dữ liệu từ: {csv_path}")
    print(f"File SQL sinh ra: {sql_path}")
    print(f"Tổng số user sẽ bị xóa: {len(student_codes)}")

if __name__ == "__main__":
    main()

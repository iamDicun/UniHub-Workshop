import csv
import json
import random
import os

def generate_password(student_code, email):
    # Format: {student code}#{phần email trước dấu @}
    email_prefix = email.split('@')[0]
    return f"{student_code}#{email_prefix}"

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(script_dir, 'mock_users.csv')
    out_csv_path = os.path.join(script_dir, 'mock_users_updated.csv')
    out_json_path = os.path.join(script_dir, 'expected_changes.json')

    # Cấu hình tùy chỉnh
    UPDATE_RATIO = 0.3        # Tỷ lệ sinh viên cũ được cập nhật tên (30%)
    NUM_NEW_STUDENTS = 50     # Số lượng sinh viên mới muốn chèn thêm
    NEW_START_CODE = 1000     # Mã bắt đầu cho sinh viên mới

    # Đọc dữ liệu từ file base
    if not os.path.exists(csv_path):
        print(f"Lỗi: Không tìm thấy {csv_path}. Vui lòng chạy generate_base_users.py trước.")
        return

    initial_data = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            initial_data.append([row['student_code'], row['name'], row['email']])

    changes = {
        "updated": [],
        "inserted": []
    }

    out_rows = [["student_code", "name", "email"]]

    # Xử lý cập nhật cho sinh viên cũ
    for row in initial_data:
        student_code, name, email = row
        
        if random.random() < UPDATE_RATIO:
            name = f"{name} (Updated)"
            changes["updated"].append({
                "student_code": student_code,
                "newName": name,
                "email": email,
                "expected_password": generate_password(student_code, email)
            })
        out_rows.append([student_code, name, email])

    # Chèn thêm records mới (Tên bình thường)
    for i in range(NUM_NEW_STUDENTS):
        sc = f"SV{NEW_START_CODE + i}"
        n = f"Sinh Viên {NEW_START_CODE + i}"
        e = f"new_{NEW_START_CODE + i}@example.com"
        
        out_rows.append([sc, n, e])
        changes["inserted"].append({
            "student_code": sc,
            "name": n,
            "email": e,
            "expected_password": generate_password(sc, e)
        })

    # Ghi file updated
    with open(out_csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(out_rows)

    # Ghi file expected
    with open(out_json_path, 'w', encoding='utf-8') as f:
        json.dump(changes, f, indent=2, ensure_ascii=False)

    print(f"--- Đã tạo file thành công với Python ---")
    print(f"File gốc: {csv_path}")
    print(f"File cập nhật: {out_csv_path}")
    print(f"File kỳ vọng (JSON): {out_json_path}")
    print(f"Ghi chú: Mật khẩu mặc định dự kiến là 'SV###@prefix'")

if __name__ == "__main__":
    main()

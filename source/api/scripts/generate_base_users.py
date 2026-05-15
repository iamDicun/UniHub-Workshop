import csv
import os
import json

def generate_password(student_code, email):
    email_prefix = email.split('@')[0]
    return f"{student_code}#{email_prefix}"

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(script_dir, 'mock_users.csv')
    
    # Cấu hình số lượng và mã bắt đầu
    NUM_USERS = 100
    START_CODE = 400

    # Tạo danh sách sinh viên gốc
    base_users = []
    for i in range(NUM_USERS):
        code = f"SV{START_CODE + i}"
        name = f"Sinh Viên {START_CODE + i}"
        email = f"sv{START_CODE + i}@example.com"
        base_users.append([code, name, email])
        
    # Ghi file gốc
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["student_code", "name", "email"])
        writer.writerows(base_users)

    print(f"--- Đã tạo base users thành công ---")
    print(f"File gốc: {csv_path}")
    print(f"Bắt đầu từ: {base_users[0][0]}")
    print(f"Kết thúc tại: {base_users[-1][0]}")

if __name__ == "__main__":
    main()

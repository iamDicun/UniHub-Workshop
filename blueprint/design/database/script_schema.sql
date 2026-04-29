-- =========================
-- EXTENSIONS
-- =========================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code TEXT UNIQUE, -- Định danh đối chiếu khi đồng bộ CSV từ hệ thống cũ
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'staff')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- WORKSHOPS
-- =========================
CREATE TABLE workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  capacity INT NOT NULL CHECK (capacity > 0),
  available_seats INT NOT NULL CHECK (available_seats >= 0), -- Khóa chặt để chống overbooking ở tầng DB
  price DECIMAL DEFAULT 0 CHECK (price >= 0), -- Hỗ trợ workshop có thu phí
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CHECK (end_time > start_time),
  CHECK (available_seats <= capacity) -- Đảm bảo logic ghế trống không bao giờ vượt quá capacity
);

-- =========================
-- REGISTRATIONS
-- =========================
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  workshop_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_student
    FOREIGN KEY (student_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_workshop
    FOREIGN KEY (workshop_id)
    REFERENCES workshops(id)
    ON DELETE CASCADE,

  CONSTRAINT unique_registration
    UNIQUE (student_id, workshop_id)
);

-- =========================
-- PAYMENTS
-- =========================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL,
  amount DECIMAL NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  idempotency_key TEXT UNIQUE, -- Cơ sở để chống trừ tiền hai lần
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_payment_registration
    FOREIGN KEY (registration_id)
    REFERENCES registrations(id)
    ON DELETE CASCADE
);

-- Đảm bảo mỗi đăng ký chỉ có MỘT thanh toán thành công
CREATE UNIQUE INDEX unique_success_payment
ON payments (registration_id)
WHERE status = 'success';

-- =========================
-- CHECKINS
-- =========================
CREATE TABLE checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL UNIQUE,
  checkin_time TIMESTAMP, -- Thời điểm dữ liệu được đẩy lên server
  offline_scanned_at TIMESTAMP, -- Thời điểm quét QR thực tế dưới app mobile
  status TEXT NOT NULL CHECK (status IN ('pending', 'synced')),
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_checkin_registration
    FOREIGN KEY (registration_id)
    REFERENCES registrations(id)
    ON DELETE CASCADE
);

-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push')),
  content TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_notification_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =========================
-- FILES (S3 metadata)
-- =========================
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('uploaded', 'processing', 'done')),
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_file_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- =========================
-- AI SUMMARIES
-- =========================
CREATE TABLE ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL UNIQUE,
  summary TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'done', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_summary_file
    FOREIGN KEY (file_id)
    REFERENCES files(id)
    ON DELETE CASCADE
);

-- =========================
-- INDEXES (Performance)
-- =========================

CREATE INDEX idx_payment_registration ON payments(registration_id);
CREATE INDEX idx_notification_user ON notifications(user_id);
CREATE INDEX idx_file_user ON files(user_id);

-- =========================
-- UPDATED_AT TRIGGER
-- =========================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = COALESCE(NEW.created_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger ví dụ
-- CREATE TRIGGER trg_users_timestamp BEFORE INSERT ON users
-- FOR EACH ROW EXECUTE FUNCTION update_timestamp();
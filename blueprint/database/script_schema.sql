-- =========================
-- EXTENSIONS
-- =========================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  capacity INT NOT NULL CHECK (capacity > 0),
  available_seats INT NOT NULL CHECK (available_seats >= 0), -- Khóa chặt để chống overbooking ở tầng DB
  price DECIMAL DEFAULT 0 CHECK (price >= 0), -- Hỗ trợ workshop có thu phí
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location TEXT,
  speaker TEXT,
  room_map_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CHECK (end_time > start_time),
  CHECK (available_seats <= capacity) -- Đảm bảo logic ghế trống không bao giờ vượt quá capacity
);

ALTER TABLE workshops ADD COLUMN IF NOT EXISTS speaker TEXT;
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS room_map_url TEXT;

-- =========================
-- REGISTRATIONS
-- =========================
CREATE TABLE IF NOT EXISTS registrations (
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

CREATE OR REPLACE FUNCTION sync_workshop_available_seats()
RETURNS TRIGGER AS $$
DECLARE
  old_active BOOLEAN;
  new_active BOOLEAN;
BEGIN
  old_active := TG_OP IN ('UPDATE', 'DELETE') AND OLD.status IN ('pending', 'confirmed');
  new_active := TG_OP IN ('INSERT', 'UPDATE') AND NEW.status IN ('pending', 'confirmed');

  IF TG_OP = 'INSERT' THEN
    IF new_active THEN
      UPDATE workshops
      SET available_seats = available_seats - 1
      WHERE id = NEW.workshop_id AND available_seats > 0;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Workshop da het cho';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF old_active THEN
      UPDATE workshops
      SET available_seats = available_seats + 1
      WHERE id = OLD.workshop_id;
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF old_active AND NOT new_active THEN
      UPDATE workshops
      SET available_seats = available_seats + 1
      WHERE id = OLD.workshop_id;
    ELSIF NOT old_active AND new_active THEN
      UPDATE workshops
      SET available_seats = available_seats - 1
      WHERE id = NEW.workshop_id AND available_seats > 0;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Workshop da het cho';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_workshop_available_seats ON registrations;
CREATE TRIGGER trg_sync_workshop_available_seats
AFTER INSERT OR UPDATE OR DELETE ON registrations
FOR EACH ROW
EXECUTE FUNCTION sync_workshop_available_seats();

UPDATE workshops w
SET available_seats = w.capacity - COALESCE((
  SELECT COUNT(*)
  FROM registrations r
  WHERE r.workshop_id = w.id
    AND r.status IN ('pending', 'confirmed')
), 0);

-- =========================
-- WORKSHOP STAFFS (Phân quyền Check-in)
-- =========================
CREATE TABLE IF NOT EXISTS workshop_staffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_workshop_staff UNIQUE (workshop_id, staff_id)
);

-- =========================
-- PAYMENTS
-- =========================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL,
  amount DECIMAL NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  idempotency_key TEXT UNIQUE, -- Cơ sở để chống trừ tiền hai lần
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_payment_registration
    FOREIGN KEY (registration_id)
    REFERENCES registrations(id)
    ON DELETE CASCADE
);

-- Đảm bảo mỗi đăng ký chỉ có MỘT thanh toán thành công
CREATE UNIQUE INDEX IF NOT EXISTS unique_success_payment
ON payments (registration_id)
WHERE status = 'success';

-- =========================
-- CHECKINS
-- =========================
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL UNIQUE,
  checkin_time TIMESTAMP, -- Thời điểm dữ liệu được đẩy lên server
  offline_scanned_at TIMESTAMP, -- Thời điểm quét QR thực tế dưới app mobile
  status TEXT NOT NULL CHECK (status IN ('pending', 'synced')),
  staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_checkin_registration
    FOREIGN KEY (registration_id)
    REFERENCES registrations(id)
    ON DELETE CASCADE
);

ALTER TABLE checkins ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE IF NOT EXISTS notifications (
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
CREATE TABLE IF NOT EXISTS files (
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
CREATE TABLE IF NOT EXISTS ai_summaries (
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

CREATE INDEX IF NOT EXISTS idx_payment_registration ON payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_notification_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_file_user ON files(user_id);

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


CREATE TABLE IF NOT EXISTS failed_jobs (
  id SERIAL PRIMARY KEY,
  payload JSONB NOT NULL,
  error_message TEXT,
  failed_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'failed'
  constraint failed_jobs_pkey primary key (id)
) TABLESPACE pg_default;

-- Thêm/Sửa bảng payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS order_code SERIAL; -- Tự động tăng, dùng làm mã đơn hàng cho PayOS
ALTER TABLE payments ADD COLUMN IF NOT EXISTS external_id TEXT;  -- Lưu paymentLinkId từ PayOS
ALTER TABLE payments ADD COLUMN IF NOT EXISTS checkout_url TEXT; -- Lưu link thanh toán để user truy cập lại
ALTER TABLE payments ADD COLUMN IF NOT EXISTS description TEXT;  -- Mô tả thanh toán (PayOS giới hạn 25 ký tự)

-- Cập nhật CHECK constraint cho status để khớp với các trạng thái của cổng thanh toán
-- (Lưu ý: Nếu bảng đã có dữ liệu, việc sửa CONSTRAINT cần cẩn thận)
-- Thay vì chỉ thêm cột, hãy thêm ràng buộc UNIQUE và INDEX
ALTER TABLE payments ADD COLUMN IF NOT EXISTS order_code SERIAL UNIQUE;
CREATE INDEX IF NOT EXISTS idx_payments_order_code ON payments(order_code);


CREATE TABLE workshop_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL,
  cdn_url TEXT NOT NULL,
  cdn_thumb TEXT NOT NULL,
  cdn_medium TEXT NOT NULL,
  cdn_large TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

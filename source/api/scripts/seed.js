import pool from '../src/config/db.js';
import bcrypt from 'bcryptjs';

const schema = `
-- =========================
-- EXTENSIONS
-- =========================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code TEXT UNIQUE,
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
  available_seats INT NOT NULL CHECK (available_seats >= 0),
  price DECIMAL DEFAULT 0 CHECK (price >= 0),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (end_time > start_time),
  CHECK (available_seats <= capacity)
);

-- =========================
-- REGISTRATIONS
-- =========================
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_registration UNIQUE (student_id, workshop_id)
);

-- =========================
-- PAYMENTS
-- =========================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Đảm bảo mỗi đăng ký chỉ có MỘT thanh toán thành công
DROP INDEX IF EXISTS unique_success_payment;
CREATE UNIQUE INDEX unique_success_payment ON payments (registration_id) WHERE status = 'success';

-- =========================
-- CHECKINS
-- =========================
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
  checkin_time TIMESTAMP,
  offline_scanned_at TIMESTAMP,
  status TEXT NOT NULL CHECK (status IN ('pending', 'synced')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push')),
  content TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- FILES (S3 metadata)
-- =========================
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('uploaded', 'processing', 'done')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- AI SUMMARIES
-- =========================
CREATE TABLE IF NOT EXISTS ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL UNIQUE REFERENCES files(id) ON DELETE CASCADE,
  summary TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'done', 'failed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_payment_registration ON payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_notification_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_file_user ON files(user_id);
`;

const seedDatabase = async () => {
  try {
    console.log('Đang kết nối Database và chạy Script tạo Schema...');
    await pool.query(schema);
    console.log('✅ Tạo Schema thành công!');

    // Kiểm tra xem user test đã tồn tại chưa
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', ['test@unihub.com']);
    
    if (rows.length === 0) {
      console.log('Đang tạo user mẫu (test@unihub.com / 123456)...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);

      await pool.query(
        `INSERT INTO users (student_code, name, email, password_hash, role) 
         VALUES ($1, $2, $3, $4, $5)`,
        ['SV001', 'UniHub Tester', 'test@unihub.com', hashedPassword, 'student']
      );
      console.log('✅ Đã tạo user mẫu thành công!');
    } else {
      console.log('⚠️ User mẫu đã tồn tại, bỏ qua bước tạo.');
    }

    console.log('🎉 Hoàn tất Seed Database!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi Seed Database:', error);
    process.exit(1);
  }
};

seedDatabase();

import pool from '../src/config/db.js';

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
  speaker TEXT,
  room_map_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (end_time > start_time),
  CHECK (available_seats <= capacity)
);

ALTER TABLE workshops ADD COLUMN IF NOT EXISTS speaker TEXT;
ALTER TABLE workshops ADD COLUMN IF NOT EXISTS room_map_url TEXT;

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
-- WORKSHOP STAFFS
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
  staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE checkins ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES users(id) ON DELETE SET NULL;

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

    const defaultPassword = '123456';
    const seedUsers = [
      {
        student_code: 'SV001',
        name: 'UniHub Student',
        email: 'test@unihub.com',
        role: 'student',
      },
      {
        student_code: 'AD001',
        name: 'UniHub Admin',
        email: 'admin@unihub.com',
        role: 'admin',
      },
      {
        student_code: 'ST001',
        name: 'UniHub Staff',
        email: 'staff@unihub.com',
        role: 'staff',
      },
    ];

    for (const user of seedUsers) {
      const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [user.email]);
      if (rows.length === 0) {
        await pool.query(
          `INSERT INTO users (student_code, name, email, password_hash, role)
           VALUES ($1, $2, $3, $4, $5)`,
          [user.student_code, user.name, user.email, defaultPassword, user.role]
        );
        console.log(`✅ Da tao user: ${user.email} / ${defaultPassword}`);
      } else {
        await pool.query(
          `UPDATE users
           SET student_code = $1, name = $2, password_hash = $3, role = $4
           WHERE email = $5`,
          [user.student_code, user.name, defaultPassword, user.role, user.email]
        );
        console.log(`🔁 Da cap nhat user: ${user.email} / ${defaultPassword}`);
      }
    }

    const { rows: adminRows } = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@unihub.com']);
    const adminId = adminRows[0]?.id || null;

    const { rows: workshopRows } = await pool.query('SELECT COUNT(*)::int AS count FROM workshops');
    if (workshopRows[0].count === 0) {
      console.log('Đang tạo workshop mẫu...');
      const now = new Date();
      const workshops = [
        {
          title: 'CV & Resume Clinic',
          description: 'Tối ưu CV theo vị trí ứng tuyển và chuẩn ATS.',
          capacity: 60,
          price: 0,
          start_time: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          end_time: new Date(now.getTime() + 25 * 60 * 60 * 1000),
          location: 'Phòng A101',
        },
        {
          title: 'Mock Interview: Backend',
          description: 'Phỏng vấn thử với mentor doanh nghiệp.',
          capacity: 40,
          price: 50000,
          start_time: new Date(now.getTime() + 48 * 60 * 60 * 1000),
          end_time: new Date(now.getTime() + 49 * 60 * 60 * 1000),
          location: 'Phòng B202',
        },
        {
          title: 'Career Roadmap in Data',
          description: 'Lộ trình nghề nghiệp Data Analyst/Engineer.',
          capacity: 80,
          price: 0,
          start_time: new Date(now.getTime() + 72 * 60 * 60 * 1000),
          end_time: new Date(now.getTime() + 73 * 60 * 60 * 1000),
          location: 'Hội trường C',
        },
      ];

      for (const workshop of workshops) {
        await pool.query(
          `INSERT INTO workshops
            (title, description, capacity, available_seats, price, start_time, end_time, location, created_by)
           VALUES ($1, $2, $3, $3, $4, $5, $6, $7, $8)`,
          [
            workshop.title,
            workshop.description,
            workshop.capacity,
            workshop.price,
            workshop.start_time.toISOString(),
            workshop.end_time.toISOString(),
            workshop.location,
            adminId,
          ]
        );
      }
      console.log('✅ Đã tạo workshop mẫu thành công!');
    } else {
      console.log('⚠️ Workshop mẫu đã tồn tại, bỏ qua bước tạo.');
    }

    console.log('🎉 Hoàn tất Seed Database!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi Seed Database:', error);
    process.exit(1);
  }
};

seedDatabase();

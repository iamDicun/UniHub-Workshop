-- Bảng staging để đổ dữ liệu CSV siêu tốc (bỏ qua constraints)
CREATE TABLE IF NOT EXISTS staging_users (
  student_code TEXT,
  name TEXT,
  email TEXT
);

-- Bảng tracking tiến độ đồng bộ CSV
CREATE TABLE IF NOT EXISTS sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Processing', 'Completed', 'Failed')),
  is_immediate BOOLEAN DEFAULT FALSE,
  triggered_by UUID, -- AI/Admin trigger (optional)
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

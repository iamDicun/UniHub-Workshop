import pool, { getClient } from '../config/db.js';
import { from as copyFrom } from 'pg-copy-streams';

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

export const findUserById = async (id) => {
  const { rows } = await pool.query('SELECT id, student_code, name, email, role FROM users WHERE id = $1', [id]);
  return rows[0];
};

// --- Sync Jobs & Staging ---

export const createSyncJob = async (fileKey, isImmediate = false, adminId = null) => {
  const { rows } = await pool.query(
    `INSERT INTO sync_jobs (file_key, status, is_immediate, triggered_by) 
     VALUES ($1, 'Pending', $2, $3) RETURNING id`,
    [fileKey, isImmediate, adminId]
  );
  return rows[0];
};

export const updateSyncJobStatus = async (jobId, status, errorMessage = null) => {
  let query = 'UPDATE sync_jobs SET status = $1';
  const params = [status, jobId];
  let pIdx = 3;
  if (status === 'Processing') {
    query += `, started_at = NOW() `;
  } else if (status === 'Completed' || status === 'Failed') {
    query += `, finished_at = NOW() `;
  }
  if (errorMessage) {
    query += `, error_message = $${pIdx} `;
    params.push(errorMessage);
    pIdx++;
  }
  query += ` WHERE id = $2`;
  await pool.query(query, params);
};

export const getPendingSyncJobs = async () => {
  const { rows } = await pool.query(`SELECT * FROM sync_jobs WHERE status = 'Pending' ORDER BY created_at ASC`);
  return rows;
};

export const getAllSyncJobs = async () => {
  const { rows } = await pool.query(`SELECT * FROM sync_jobs ORDER BY created_at DESC`);
  return rows;
};

export const truncateStagingUsers = async () => {
  // Restart identity không ý nghĩa với text nhưng vẫn an toàn nếu sau này có id
  await pool.query('TRUNCATE staging_users');
};

export const copyUsersFromStream = async (readStream) => {
  const client = await getClient();
  try {
    const ingestStream = client.query(
      copyFrom('COPY staging_users (student_code, name, email) FROM STDIN WITH (FORMAT csv, HEADER true)')
    );
    
    return new Promise((resolve, reject) => {
      readStream.on('error', reject);
      ingestStream.on('error', reject);
      ingestStream.on('finish', resolve);
      readStream.pipe(ingestStream);
    });
  } finally {
    client.release();
  }
};

export const mergeStagingUsersIntoMain = async () => {
  // Upsert: Dựa vào student_code (hoặc email nếu student_code = NULL)
  // Trong requirements, student_code UNIQUE. Password để một default bcrypt hash cho account mới tạo tự động
  // '$2a$10$xyz' là mock hash chẳng hạn, hoặc null nếu cho phép
  await pool.query(`
    INSERT INTO users (student_code, name, email, role, password_hash)
    SELECT 
      student_code, 
      name, 
      email, 
      'student', 
      student_code || '#' || split_part(email, '@', 1)
    FROM staging_users
    WHERE student_code IS NOT NULL
    ON CONFLICT (student_code)
    DO UPDATE SET 
      name = EXCLUDED.name,
      email = EXCLUDED.email
  `);
};


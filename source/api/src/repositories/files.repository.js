import pool from '../config/db.js';

export const insertFile = async (file) => {
  const { rows } = await pool.query(
    `INSERT INTO files (user_id, object_key, file_name, status, mime_type, size)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, object_key, file_name, status, mime_type, size, created_at`,
    [
      file.user_id,
      file.object_key,
      file.file_name,
      file.status,
      file.mime_type,
      file.size,
    ],
  );
  return rows[0];
};

export const updateFileStatus = async (id, status) => {
  const { rows } = await pool.query(
    `UPDATE files
     SET status = $2, updated_at = now()
     WHERE id = $1
     RETURNING id, object_key, status, updated_at`,
    [id, status],
  );
  return rows[0] || null;
};

export const getFileById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, user_id, object_key, file_name, status, mime_type, size, created_at, updated_at FROM files WHERE id = $1',
    [id],
  );
  return rows[0] || null;
};

export const getFilesByUser = async (userId) => {
  const { rows } = await pool.query(
    'SELECT id, user_id, object_key, file_name, status, mime_type, size, created_at, updated_at FROM files WHERE user_id = $1 ORDER BY created_at DESC',
    [userId],
  );
  return rows;
};

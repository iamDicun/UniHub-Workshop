import pool from '../config/db.js';

export const getFailedJobs = async () => {
  const query = 'SELECT * FROM failed_jobs ORDER BY failed_at DESC';
  const result = await pool.query(query);
  return result.rows;
};

export const getFailedJobById = async (id) => {
  const query = 'SELECT * FROM failed_jobs WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const updateFailedJobStatus = async (id, status) => {
  const query = 'UPDATE failed_jobs SET status = $1 WHERE id = $2';
  await pool.query(query, [status, id]);
};

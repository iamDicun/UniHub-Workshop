import pool from '../config/db.js';

export const getDbStatus = async () => {
  try {
    // Thử query nhẹ để kiểm tra kết nối tới Supabase
    const res = await pool.query('SELECT 1 AS status');
    return res.rows[0].status === 1 ? 'connected' : 'error';
  } catch (error) {
    console.error('DB Health check failed:', error.message);
    return 'disconnected';
  }
};

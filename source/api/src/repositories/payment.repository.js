import pool from '../config/db.js';

export const getPaymentByOrderCodeForUpdate = async (orderCode, client) => {
  const db = client || pool;
  const { rows } = await db.query('SELECT * FROM payments WHERE order_code = $1 FOR UPDATE', [orderCode]);
  return rows[0];
};

export const updatePaymentStatus = async (id, status, client) => {
  const db = client || pool;
  await db.query('UPDATE payments SET status = $1 WHERE id = $2', [status, id]);
};

export const getMyPayments = async (studentId) => {
  const query = `
    SELECT p.*, w.title as workshop_title 
    FROM payments p
    JOIN registrations r ON p.registration_id = r.id
    JOIN workshops w ON r.workshop_id = w.id
    WHERE r.student_id = $1
    ORDER BY p.created_at DESC
  `;
  const result = await pool.query(query, [studentId]);
  return result.rows;
};

export const getAllPayments = async () => {
  const query = `
    SELECT p.*, w.title as workshop_title, u.email as student_email, u.name as student_name
    FROM payments p
    JOIN registrations r ON p.registration_id = r.id
    JOIN workshops w ON r.workshop_id = w.id
    JOIN users u ON r.student_id = u.id
    ORDER BY p.created_at DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

import pool from '../config/db.js';

const buildError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const getWorkshopStaff = async (workshopId) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.student_code 
     FROM users u
     JOIN workshop_staffs ws ON u.id = ws.staff_id
     WHERE ws.workshop_id = $1`,
    [workshopId]
  );
  return rows;
};

export const addWorkshopStaff = async (workshopId, email) => {
  if (!email) throw buildError('Email khong duoc de trong', 400);
  
  const { rows: users } = await pool.query(
    `SELECT id, role FROM users WHERE email = $1`,
    [email]
  );
  
  if (users.length === 0) {
    throw buildError('Khong tim thay nguoi dung voi email nay', 404);
  }
  
  const user = users[0];
  if (user.role !== 'staff') {
    throw buildError('Nguoi dung nay khong phai la staff', 400);
  }

  await pool.query(
    `INSERT INTO workshop_staffs (workshop_id, staff_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [workshopId, user.id]
  );

  return { success: true };
};

export const removeWorkshopStaff = async (workshopId, staffId) => {
  await pool.query(
    `DELETE FROM workshop_staffs WHERE workshop_id = $1 AND staff_id = $2`,
    [workshopId, staffId]
  );
  return { success: true };
};

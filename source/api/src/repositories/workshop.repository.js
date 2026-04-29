import pool from '../config/db.js';

const getDb = (db) => db || pool;

const workshopSelect = `
  w.id,
  w.title,
  w.description,
  w.capacity,
  w.available_seats,
  w.price,
  w.start_time,
  w.end_time,
  w.location,
  w.speaker,
  w.room_map_url,
  w.created_by,
  w.created_at,
  (SELECT string_agg(u.email, ', ') FROM users u JOIN workshop_staffs ws ON u.id = ws.staff_id WHERE ws.workshop_id = w.id) AS staff_emails
`;

const workshopReturnSelect = `
  id,
  title,
  description,
  capacity,
  available_seats,
  price,
  start_time,
  end_time,
  location,
  speaker,
  room_map_url,
  created_by,
  created_at,
  (SELECT string_agg(u.email, ', ') FROM users u JOIN workshop_staffs ws ON u.id = ws.staff_id WHERE ws.workshop_id = workshops.id) AS staff_emails
`;

export const listWorkshopsForUser = async (userId) => {
  const { rows } = await pool.query(
    `SELECT
      ${workshopSelect},
      r.id AS registration_id,
      r.status AS registration_status
     FROM workshops w
     LEFT JOIN registrations r
       ON r.workshop_id = w.id AND r.student_id = $1
     ORDER BY w.start_time ASC`,
    [userId]
  );
  return rows;
};

export const getWorkshopByIdForUser = async (workshopId, userId) => {
  const { rows } = await pool.query(
    `SELECT
      ${workshopSelect},
      r.id AS registration_id,
      r.status AS registration_status
     FROM workshops w
     LEFT JOIN registrations r
       ON r.workshop_id = w.id AND r.student_id = $2
     WHERE w.id = $1`,
    [workshopId, userId]
  );
  return rows[0];
};

export const getWorkshopById = async (workshopId, db) => {
  const { rows } = await getDb(db).query(
    `SELECT ${workshopReturnSelect} FROM workshops WHERE id = $1`,
    [workshopId]
  );
  return rows[0];
};

export const getWorkshopForUpdate = async (workshopId, db) => {
  const { rows } = await getDb(db).query(
    'SELECT id, capacity, available_seats FROM workshops WHERE id = $1 FOR UPDATE',
    [workshopId]
  );
  return rows[0];
};

export const getUserRegistrationForWorkshop = async (workshopId, userId) => {
  const { rows } = await pool.query(
    'SELECT id AS registration_id, status AS registration_status FROM registrations WHERE workshop_id = $1 AND student_id = $2',
    [workshopId, userId]
  );
  return rows[0] || { registration_id: null, registration_status: null };
};

export const createWorkshop = async (workshop) => {
  const { rows } = await pool.query(
    `INSERT INTO workshops
      (title, description, capacity, available_seats, price, start_time, end_time, location, speaker, room_map_url, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING ${workshopReturnSelect}`,
    [
      workshop.title,
      workshop.description,
      workshop.capacity,
      workshop.available_seats,
      workshop.price,
      workshop.start_time,
      workshop.end_time,
      workshop.location,
      workshop.speaker,
      workshop.room_map_url,
      workshop.created_by,
    ]
  );
  return rows[0];
};

export const updateWorkshop = async (workshopId, fields) => {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    return null;
  }

  const setClause = entries
    .map(([key], index) => `${key} = $${index + 1}`)
    .join(', ');

  const values = entries.map(([, value]) => value);
  values.push(workshopId);

  const { rows } = await pool.query(
    `UPDATE workshops
     SET ${setClause}
     WHERE id = $${values.length}
     RETURNING ${workshopReturnSelect}`,
    values
  );
  return rows[0];
};

export const deleteWorkshop = async (workshopId) => {
  const { rows } = await pool.query('DELETE FROM workshops WHERE id = $1 RETURNING id', [
    workshopId,
  ]);
  return rows[0];
};

export const decrementSeats = async (workshopId, db) => {
  const { rows } = await getDb(db).query(
    `UPDATE workshops
     SET available_seats = available_seats - 1
     WHERE id = $1 AND available_seats > 0
     RETURNING available_seats`,
    [workshopId]
  );
  return rows[0];
};

export const incrementSeats = async (workshopId, db) => {
  const { rows } = await getDb(db).query(
    `UPDATE workshops
     SET available_seats = available_seats + 1
     WHERE id = $1
     RETURNING available_seats`,
    [workshopId]
  );
  return rows[0];
};

export const listWorkshopRegistrations = async (workshopId) => {
  const { rows } = await pool.query(
    `SELECT
      r.id AS registration_id,
      r.status AS registration_status,
      r.created_at AS registration_created_at,
      u.id AS student_id,
      u.name AS student_name,
      u.email AS student_email,
      u.student_code AS student_code,
      c.checkin_time AS checkin_time
     FROM registrations r
     JOIN users u ON u.id = r.student_id
     LEFT JOIN checkins c ON c.registration_id = r.id
     WHERE r.workshop_id = $1
     ORDER BY r.created_at ASC`,
    [workshopId]
  );
  return rows;
};

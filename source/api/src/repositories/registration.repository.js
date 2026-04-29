import pool from '../config/db.js';

const getDb = (db) => db || pool;

export const findRegistrationByStudentAndWorkshop = async (studentId, workshopId, db) => {
  const { rows } = await getDb(db).query(
    `SELECT id, status, workshop_id
     FROM registrations
     WHERE student_id = $1 AND workshop_id = $2
     FOR UPDATE`,
    [studentId, workshopId]
  );
  return rows[0];
};

export const findRegistrationForCancel = async (registrationId, studentId, db) => {
  const { rows } = await getDb(db).query(
    `SELECT id, status, workshop_id, student_id
     FROM registrations
     WHERE id = $1 AND student_id = $2
     FOR UPDATE`,
    [registrationId, studentId]
  );
  return rows[0];
};

export const getRegistrationById = async (registrationId, db) => {
  const { rows } = await getDb(db).query(
    `SELECT id, student_id, workshop_id, status
     FROM registrations
     WHERE id = $1`,
    [registrationId]
  );
  return rows[0];
};

export const createRegistration = async (studentId, workshopId, status, db) => {
  const { rows } = await getDb(db).query(
    `INSERT INTO registrations (student_id, workshop_id, status)
     VALUES ($1, $2, $3)
     RETURNING id, student_id, workshop_id, status, created_at`,
    [studentId, workshopId, status]
  );
  return rows[0];
};

export const updateRegistrationStatus = async (registrationId, status, db) => {
  const { rows } = await getDb(db).query(
    `UPDATE registrations
     SET status = $2
     WHERE id = $1
     RETURNING id, student_id, workshop_id, status, created_at`,
    [registrationId, status]
  );
  return rows[0];
};

export const getRegistrationDetails = async (registrationId, db) => {
  const { rows } = await getDb(db).query(
    `SELECT
      r.id AS registration_id,
      r.status AS registration_status,
      r.created_at AS registration_created_at,
      u.id AS student_id,
      u.name AS student_name,
      u.email AS student_email,
      u.student_code AS student_code,
      w.id AS workshop_id,
      w.title AS workshop_title,
      w.location AS workshop_location,
      w.start_time AS workshop_start_time,
      w.end_time AS workshop_end_time
     FROM registrations r
     JOIN users u ON u.id = r.student_id
     JOIN workshops w ON w.id = r.workshop_id
     WHERE r.id = $1`,
    [registrationId]
  );
  return rows[0];
};

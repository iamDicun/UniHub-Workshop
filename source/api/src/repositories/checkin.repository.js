import pool from '../config/db.js';

const getDb = (db) => db || pool;

export const findCheckinByRegistrationId = async (registrationId, db) => {
  const { rows } = await getDb(db).query(
    `SELECT id, registration_id, status, checkin_time, offline_scanned_at
     FROM checkins
     WHERE registration_id = $1`,
    [registrationId]
  );
  return rows[0];
};

export const createCheckin = async (registrationId, offlineScannedAt, staffId, db) => {
  const { rows } = await getDb(db).query(
    `INSERT INTO checkins (registration_id, checkin_time, offline_scanned_at, status, staff_id)
     VALUES ($1, NOW(), $2, 'synced', $3)
     RETURNING id, registration_id, status, checkin_time, offline_scanned_at, staff_id`,
    [registrationId, offlineScannedAt, staffId]
  );
  return rows[0];
};

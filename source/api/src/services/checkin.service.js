import pool from '../config/db.js';
import {
  getRegistrationById,
  getRegistrationDetails,
} from '../repositories/registration.repository.js';
import {
  findCheckinByRegistrationId,
  createCheckin,
} from '../repositories/checkin.repository.js';

const buildError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseOfflineTime = (value) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw buildError('Thoi gian check-in offline khong hop le', 400);
  }
  return parsed.toISOString();
};

export const checkInRegistration = async (registrationId, offlineScannedAt, staffUser) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const registration = await getRegistrationById(registrationId, client);
    if (!registration) {
      throw buildError('Dang ky khong ton tai', 404);
    }

    if (registration.status !== 'confirmed') {
      throw buildError('Dang ky chua duoc xac nhan hoac da huy', 409);
    }

    if (staffUser && staffUser.role === 'staff') {
      const { rows } = await client.query(
        'SELECT 1 FROM workshop_staffs WHERE workshop_id = $1 AND staff_id = $2',
        [registration.workshop_id, staffUser.id]
      );
      if (rows.length === 0) {
        throw buildError('Ban khong co quyen check-in cho workshop nay', 403);
      }
    }

    const existingCheckin = await findCheckinByRegistrationId(registrationId, client);
    if (existingCheckin) {
      throw buildError('Dang ky da duoc check-in', 409);
    }

    const offlineTime = parseOfflineTime(offlineScannedAt);
    const staffId = staffUser ? staffUser.id : null;
    const checkin = await createCheckin(registrationId, offlineTime, staffId, client);
    const details = await getRegistrationDetails(registrationId, client);

    await client.query('COMMIT');

    return {
      checkin,
      registration: details,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

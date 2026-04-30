import pool from '../config/db.js';
import {
  getWorkshopForUpdate,
  decrementSeats,
  incrementSeats,
  getWorkshopById,
} from '../repositories/workshop.repository.js';
import {
  findRegistrationByStudentAndWorkshop,
  findRegistrationForCancel,
  createRegistration,
  updateRegistrationStatus,
} from '../repositories/registration.repository.js';
import { findCheckinByRegistrationId } from '../repositories/checkin.repository.js';
import { deleteCachedWorkshop, setCachedWorkshop } from './workshop.cache.js';
import { publishRegistrationEvent } from '../queue/notification.producer.js';

const buildError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const registerForWorkshop = async (workshopId, studentId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const workshop = await getWorkshopForUpdate(workshopId, client);
    if (!workshop) {
      throw buildError('Workshop khong ton tai', 404);
    }

    const existing = await findRegistrationByStudentAndWorkshop(studentId, workshopId, client);
    if (existing && existing.status !== 'cancelled') {
      throw buildError('Ban da dang ky workshop nay', 409);
    }

    const seatUpdate = await decrementSeats(workshopId, client);
    if (!seatUpdate) {
      throw buildError('Workshop da het cho', 409);
    }

    let registration;
    if (existing && existing.status === 'cancelled') {
      registration = await updateRegistrationStatus(existing.id, 'confirmed', client);
    } else {
      registration = await createRegistration(studentId, workshopId, 'confirmed', client);
    }

    await client.query('COMMIT');
    
    const updatedWorkshop = await getWorkshopById(workshopId);
    if (updatedWorkshop) {
      await setCachedWorkshop(updatedWorkshop);
    }

    // Đẩy sự kiện vào RabbitMQ để gửi Email không đồng bộ
    await publishRegistrationEvent({
      studentId: studentId,
      workshopId: workshopId,
      registrationId: registration.id
    });

    return {
      registration_id: registration.id,
      status: registration.status,
      workshop_id: registration.workshop_id,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      throw buildError('Ban da dang ky workshop nay', 409);
    }
    throw error;
  } finally {
    client.release();
  }
};

export const cancelRegistration = async (registrationId, studentId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const registration = await findRegistrationForCancel(registrationId, studentId, client);
    if (!registration) {
      throw buildError('Dang ky khong ton tai', 404);
    }

    if (registration.status === 'cancelled') {
      throw buildError('Dang ky da duoc huy truoc do', 400);
    }

    const checkin = await findCheckinByRegistrationId(registrationId, client);
    if (checkin) {
      throw buildError('Khong the huy dang ky da check-in', 409);
    }

    await updateRegistrationStatus(registrationId, 'cancelled', client);
    await incrementSeats(registration.workshop_id, client);

    await client.query('COMMIT');

    const updatedWorkshop = await getWorkshopById(registration.workshop_id);
    if (updatedWorkshop) {
      await setCachedWorkshop(updatedWorkshop);
    }

    return {
      registration_id: registrationId,
      status: 'cancelled',
      workshop_id: registration.workshop_id,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

import pool from '../config/db.js';
import {
  listWorkshopsForUser,
  getWorkshopByIdForUser,
  getWorkshopById,
  getUserRegistrationForWorkshop,
  createWorkshop as createWorkshopRepo,
  updateWorkshop as updateWorkshopRepo,
  deleteWorkshop as deleteWorkshopRepo,
  listWorkshopRegistrations,
} from '../repositories/workshop.repository.js';
import {
  getCachedWorkshop,
  setCachedWorkshop,
  deleteCachedWorkshop,
} from './workshop.cache.js';

const buildError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const parseInteger = (value, field) => {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue)) {
    throw buildError(`Gia tri ${field} khong hop le`, 400);
  }
  return numberValue;
};

const parseNumber = (value, field) => {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    throw buildError(`Gia tri ${field} khong hop le`, 400);
  }
  return numberValue;
};

const parseDate = (value, field) => {
  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    throw buildError(`Gia tri ${field} khong hop le`, 400);
  }
  return dateValue.toISOString();
};

const syncWorkshopStaff = async (workshopId, staffEmails) => {
  if (staffEmails === undefined) return;
  
  const emails = (staffEmails || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  // Clear existing staff for simple bulk sync
  await pool.query('DELETE FROM workshop_staffs WHERE workshop_id = $1', [workshopId]);

  if (emails.length > 0) {
    // Find staff IDs by email
    const { rows: staffUsers } = await pool.query(
      "SELECT id FROM users WHERE email = ANY($1) AND role = 'staff'",
      [emails]
    );

    for (const user of staffUsers) {
      await pool.query(
        'INSERT INTO workshop_staffs (workshop_id, staff_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [workshopId, user.id]
      );
    }
  }
};

export const listWorkshops = async (userId) => {
  return listWorkshopsForUser(userId);
};

export const getWorkshopDetail = async (workshopId, userId) => {
  let workshop = await getCachedWorkshop(workshopId);
  
  if (!workshop) {
    workshop = await getWorkshopById(workshopId);
    if (workshop) {
      await setCachedWorkshop(workshop);
    }
  }

  if (!workshop) {
    throw buildError('Workshop khong ton tai', 404);
  }

  const reg = await getUserRegistrationForWorkshop(workshopId, userId);
  return { ...workshop, ...reg };
};

export const createWorkshop = async (payload, adminId) => {
  const title = payload.title?.trim();
  if (!title) {
    throw buildError('Vui long nhap tieu de workshop', 400);
  }

  if (payload.capacity === undefined) {
    throw buildError('Vui long nhap suc chua', 400);
  }

  if (!payload.start_time || !payload.end_time) {
    throw buildError('Vui long nhap thoi gian bat dau va ket thuc', 400);
  }

  const capacity = parseInteger(payload.capacity, 'capacity');
  if (capacity <= 0) {
    throw buildError('Suc chua phai lon hon 0', 400);
  }

  const price = payload.price === undefined || payload.price === ''
    ? 0
    : parseNumber(payload.price, 'price');

  const startTime = parseDate(payload.start_time, 'start_time');
  const endTime = parseDate(payload.end_time, 'end_time');

  if (new Date(startTime) >= new Date(endTime)) {
    throw buildError('Thoi gian ket thuc phai sau thoi gian bat dau', 400);
  }

  const workshop = await createWorkshopRepo({
    title,
    description: payload.description?.trim() || null,
    capacity,
    available_seats: capacity,
    price,
    start_time: startTime,
    end_time: endTime,
    location: payload.location?.trim() || null,
    speaker: payload.speaker?.trim() || null,
    room_map_url: payload.room_map_url?.trim() || null,
    created_by: adminId,
  });

  if (payload.staff_emails !== undefined) {
    await syncWorkshopStaff(workshop.id, payload.staff_emails);
    const updatedWorkshop = await getWorkshopById(workshop.id);
    await setCachedWorkshop(updatedWorkshop);
    return updatedWorkshop;
  }

  await setCachedWorkshop(workshop);
  return workshop;
};

export const updateWorkshop = async (workshopId, payload) => {
  const existing = await getWorkshopById(workshopId);
  if (!existing) {
    throw buildError('Workshop khong ton tai', 404);
  }

  const updates = {};

  if (payload.title !== undefined) {
    const title = payload.title?.trim();
    if (!title) {
      throw buildError('Vui long nhap tieu de workshop', 400);
    }
    updates.title = title;
  }

  if (payload.description !== undefined) {
    updates.description = payload.description?.trim() || null;
  }

  if (payload.location !== undefined) {
    updates.location = payload.location?.trim() || null;
  }

  if (payload.speaker !== undefined) {
    updates.speaker = payload.speaker?.trim() || null;
  }

  if (payload.room_map_url !== undefined) {
    updates.room_map_url = payload.room_map_url?.trim() || null;
  }

  if (payload.price !== undefined && payload.price !== '') {
    updates.price = parseNumber(payload.price, 'price');
  }

  if (payload.price === '') {
    updates.price = 0;
  }

  const startTime = payload.start_time !== undefined
    ? parseDate(payload.start_time, 'start_time')
    : existing.start_time;
  const endTime = payload.end_time !== undefined
    ? parseDate(payload.end_time, 'end_time')
    : existing.end_time;

  if (new Date(startTime) >= new Date(endTime)) {
    throw buildError('Thoi gian ket thuc phai sau thoi gian bat dau', 400);
  }

  if (payload.start_time !== undefined) {
    updates.start_time = startTime;
  }

  if (payload.end_time !== undefined) {
    updates.end_time = endTime;
  }

  if (payload.capacity !== undefined) {
    const capacity = parseInteger(payload.capacity, 'capacity');
    if (capacity <= 0) {
      throw buildError('Suc chua phai lon hon 0', 400);
    }
    const confirmedCount = existing.capacity - existing.available_seats;
    if (capacity < confirmedCount) {
      throw buildError('Suc chua moi khong the nho hon so dang ky hien tai', 400);
    }
    updates.capacity = capacity;
    updates.available_seats = capacity - confirmedCount;
  }

  const updated = await updateWorkshopRepo(workshopId, updates);
  
  if (payload.staff_emails !== undefined) {
    await syncWorkshopStaff(workshopId, payload.staff_emails);
  }

  const finalWorkshop = await getWorkshopById(workshopId);
  if (finalWorkshop) {
    await setCachedWorkshop(finalWorkshop);
  }

  return finalWorkshop || existing;
};

export const deleteWorkshop = async (workshopId) => {
  const deleted = await deleteWorkshopRepo(workshopId);
  if (!deleted) {
    throw buildError('Workshop khong ton tai', 404);
  }
  await deleteCachedWorkshop(workshopId);
  return deleted;
};

export const getWorkshopRegistrations = async (workshopId) => {
  const workshop = await getWorkshopById(workshopId);
  if (!workshop) {
    throw buildError('Workshop khong ton tai', 404);
  }
  const registrations = await listWorkshopRegistrations(workshopId);
  return {
    workshop,
    registrations,
  };
};

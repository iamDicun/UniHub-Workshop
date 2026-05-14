import { checkInRegistration } from '../services/checkin.service.js';

export const createCheckin = async (req, res, next) => {
  try {
    const { workshop_id, registration_id, offline_scanned_at } = req.body;
    if (!registration_id) {
      return res.status(400).json({ message: 'Vui long nhap ma dang ky' });
    }
    if (!workshop_id) {
      return res.status(400).json({ message: 'Vui long cung cap workshop_id' });
    }

    const result = await checkInRegistration(workshop_id, registration_id, offline_scanned_at, req.user);
    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

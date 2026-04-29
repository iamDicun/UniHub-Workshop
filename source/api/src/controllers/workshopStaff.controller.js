import {
  getWorkshopStaff,
  addWorkshopStaff,
  removeWorkshopStaff,
} from '../services/workshopStaff.service.js';

export const getWorkshopStaffHandler = async (req, res, next) => {
  try {
    const data = await getWorkshopStaff(req.params.id);
    res.status(200).json({ status: 'success', data });
  } catch (error) { 
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error); 
  }
};

export const addWorkshopStaffHandler = async (req, res, next) => {
  try {
    const data = await addWorkshopStaff(req.params.id, req.body.email);
    res.status(200).json({ status: 'success', data });
  } catch (error) { 
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error); 
  }
};

export const removeWorkshopStaffHandler = async (req, res, next) => {
  try {
    const data = await removeWorkshopStaff(req.params.id, req.params.staffId);
    res.status(200).json({ status: 'success', data });
  } catch (error) { 
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error); 
  }
};

import {
  listWorkshops,
  getWorkshopDetail,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  getWorkshopRegistrations,
} from '../services/workshop.service.js';

export const getWorkshops = async (req, res, next) => {
  try {
    const workshops = await listWorkshops(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { workshops },
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkshopById = async (req, res, next) => {
  try {
    const workshop = await getWorkshopDetail(req.params.id, req.user.id);
    res.status(200).json({
      status: 'success',
      data: workshop,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const createWorkshopHandler = async (req, res, next) => {
  try {
    const workshop = await createWorkshop(req.body, req.user.id);
    res.status(201).json({
      status: 'success',
      data: workshop,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const updateWorkshopHandler = async (req, res, next) => {
  try {
    const workshop = await updateWorkshop(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: workshop,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteWorkshopHandler = async (req, res, next) => {
  try {
    const deleted = await deleteWorkshop(req.params.id);
    res.status(200).json({
      status: 'success',
      data: deleted,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const getWorkshopRegistrationsHandler = async (req, res, next) => {
  try {
    const data = await getWorkshopRegistrations(req.params.id);
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

import {
  registerForWorkshop,
  cancelRegistration,
} from '../services/registration.service.js';

export const registerWorkshop = async (req, res, next) => {
  try {
    const result = await registerForWorkshop(req.params.id, req.user.id);
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

export const cancelRegistrationHandler = async (req, res, next) => {
  try {
    const result = await cancelRegistration(req.params.id, req.user.id);
    res.status(200).json({
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

import { checkHealth } from '../services/health.service.js';

export const getHealth = async (req, res, next) => {
  try {
    const status = await checkHealth();
    res.status(200).json(status);
  } catch (error) {
    next(error);
  }
};

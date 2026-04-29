import { loginUser, getUserProfile } from '../services/auth.service.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email và password' });
    }

    const data = await loginUser(email, password);
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await getUserProfile(req.user.id);
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

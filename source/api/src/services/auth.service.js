import jwt from 'jsonwebtoken';
import { findUserByEmail, findUserById } from '../repositories/user.repository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'unihub_workshop_super_secret_key_2026';

export const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) {
    const error = new Error('Email không tồn tại!');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = password === user.password_hash;
  if (!isMatch) {
    const error = new Error('Mật khẩu không chính xác!');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      student_code: user.student_code
    }
  };
};

export const getUserProfile = async (id) => {
  const user = await findUserById(id);
  if (!user) {
    const error = new Error('User không tồn tại!');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

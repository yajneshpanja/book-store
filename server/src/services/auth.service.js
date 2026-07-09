import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authRepository from '../repositories/auth.repository.js';
import { createError } from '../middlewares/errorHandler.js';

const JWT_SECRET  = process.env.JWT_SECRET  || 'bookstore_dev_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Validate credentials and return a signed JWT + public user data.
 * Throws a 401 error for invalid email or password.
 */
export const login = async (email, password) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw createError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw createError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }

  const payload = { sub: user.id, email: user.email, role: user.role };
  const token   = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  return {
    token,
    user: {
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  };
};

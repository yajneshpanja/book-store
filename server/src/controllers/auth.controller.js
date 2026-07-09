import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { token, user: { id, name, email, role } }
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

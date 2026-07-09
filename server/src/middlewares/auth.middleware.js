import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bookstore_dev_secret';

/**
 * requireAuth middleware — protects routes that need a valid JWT.
 * Reads the Bearer token from the Authorization header and attaches
 * the decoded payload to req.user.
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'] ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return sendError(res, 'Authentication required', 'UNAUTHORIZED', 401);
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return sendError(res, 'Invalid or expired token', 'TOKEN_INVALID', 401);
  }
};

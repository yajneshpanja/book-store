import { sendError } from '../utils/response.js';

/**
 * Global error handler — must be last middleware in app.js
 */
export const errorHandler = (err, _req, res, _next) => {
  console.error('[ErrorHandler]', err);

  // MySQL duplicate / constraint errors
  if (err.code === 'ER_DUP_ENTRY') {
    return sendError(res, 'Duplicate entry', 'DUPLICATE_ENTRY', 409);
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return sendError(res, 'Referenced resource not found', 'REFERENCE_ERROR', 400);
  }

  const statusCode = err.statusCode || 500;
  const message    = err.message    || 'Internal server error';
  const code       = err.code       || 'SERVER_ERROR';

  sendError(res, message, code, statusCode);
};

/**
 * 404 handler — must sit before errorHandler
 */
export const notFound = (_req, res) => {
  sendError(res, 'Route not found', 'NOT_FOUND', 404);
};

/**
 * Small helper to create typed HTTP errors that errorHandler understands.
 */
export const createError = (message, code, statusCode) => {
  const err = new Error(message);
  err.code = code;
  err.statusCode = statusCode;
  return err;
};

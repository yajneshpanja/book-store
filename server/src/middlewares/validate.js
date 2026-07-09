import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.js';

/**
 * Run after a chain of express-validator checks.
 * If there are errors, short-circuit and respond 422.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      'Validation failed',
      'VALIDATION_ERROR',
      422,
      errors.array().map(e => ({ field: e.path, message: e.msg }))
    );
  }
  next();
};

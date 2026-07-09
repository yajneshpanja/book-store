import { body } from 'express-validator';

/**
 * POST /api/auth/login — validate request body fields.
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('A valid email address is required'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

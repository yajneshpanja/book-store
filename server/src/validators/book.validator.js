import { param } from 'express-validator';

/**
 * Validators for book routes.
 */

export const validateBookId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Book ID must be a positive integer'),
];

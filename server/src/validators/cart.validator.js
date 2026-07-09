import { body, param } from 'express-validator';

/**
 * Validators for all cart endpoints.
 */

// POST /api/cart/items
export const validateAddItem = [
  body('bookId')
    .isInt({ min: 1 })
    .withMessage('bookId must be a positive integer'),

  body('quantity')
    .optional()
    .isInt({ min: 1, max: 99 })
    .withMessage('quantity must be an integer between 1 and 99'),
];

// PUT /api/cart/items/:bookId
export const validateUpdateItem = [
  param('bookId')
    .isInt({ min: 1 })
    .withMessage('bookId param must be a positive integer'),

  body('quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('quantity must be an integer between 1 and 99'),
];

// DELETE /api/cart/items/:bookId
export const validateBookIdParam = [
  param('bookId')
    .isInt({ min: 1 })
    .withMessage('bookId param must be a positive integer'),
];

// POST /api/cart/validate  (unchanged — reuse existing)
export const validateCartItems = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('items must be a non-empty array'),

  body('items.*.bookId')
    .isInt({ min: 1 })
    .withMessage('Each item must have a valid bookId (positive integer)'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each item must have a quantity >= 1'),
];

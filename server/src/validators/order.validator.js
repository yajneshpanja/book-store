import { body, param } from 'express-validator';

/**
 * Validators for order endpoints.
 */

export const validateCreateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('items must be a non-empty array'),

  body('items.*.bookId')
    .isInt({ min: 1 })
    .withMessage('Each item must have a valid bookId (positive integer)'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each item must have a quantity >= 1'),

  body('customerName')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Customer name must be a string (max 255 chars)'),

  body('customerEmail')
    .optional()
    .isEmail()
    .withMessage('Customer email must be a valid email address')
    .normalizeEmail(),
];

export const validateOrderId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),
];

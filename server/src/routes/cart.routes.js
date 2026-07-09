import express from 'express';
import * as cartController from '../controllers/cart.controller.js';
import {
  validateAddItem,
  validateUpdateItem,
  validateBookIdParam,
  validateCartItems,
} from '../validators/cart.validator.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Cart endpoints — all require a valid JWT (Authorization: Bearer <token>).
 * The cart is keyed by the authenticated user's ID ("user:<id>").
 *
 * GET    /api/cart                  — get full cart
 * POST   /api/cart/items            — add item (or increment qty)
 * PUT    /api/cart/items/:bookId    — set exact quantity
 * DELETE /api/cart/items/:bookId    — remove single item
 * DELETE /api/cart                  — clear entire cart
 * POST   /api/cart/validate         — price-check (stateless, still requires auth)
 */

router.use(requireAuth);   // every cart route needs a valid JWT

router.get('/',                                                    cartController.getCart);
router.post('/items',      validateAddItem,    validate,           cartController.addItem);
router.put('/items/:bookId', validateUpdateItem, validate,         cartController.updateItem);
router.delete('/items/:bookId', validateBookIdParam, validate,     cartController.removeItem);
router.delete('/',                                                 cartController.clearCart);
router.post('/validate',   validateCartItems,  validate,           cartController.validateCart);

export default router;

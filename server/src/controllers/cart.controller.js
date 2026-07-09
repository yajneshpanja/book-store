import * as cartService from '../services/cart.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Derive a stable cart session key from the authenticated user.
 * Format: "user:<userId>"
 * requireAuth middleware (applied in cart.routes.js) guarantees req.user exists.
 */
const getSessionId = (req) => `user:${req.user.sub}`;

// ── GET /api/cart ─────────────────────────────────────────────────────────────
export const getCart = async (req, res, next) => {
  try {
    const data = await cartService.getCart(getSessionId(req));
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/cart/items ──────────────────────────────────────────────────────
export const addItem = async (req, res, next) => {
  try {
    const { bookId, quantity = 1 } = req.body;
    const data = await cartService.addItem(getSessionId(req), Number(bookId), Number(quantity));
    sendSuccess(res, data, 200);
  } catch (err) {
    if (err.message?.includes('not found')) return sendError(res, err.message, 'BOOK_NOT_FOUND', 404);
    next(err);
  }
};

// ── PUT /api/cart/items/:bookId ───────────────────────────────────────────────
export const updateItem = async (req, res, next) => {
  try {
    const bookId   = Number(req.params.bookId);
    const quantity = Number(req.body.quantity);
    const data = await cartService.updateItem(getSessionId(req), bookId, quantity);
    sendSuccess(res, data);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.code, err.statusCode);
    next(err);
  }
};

// ── DELETE /api/cart/items/:bookId ────────────────────────────────────────────
export const removeItem = async (req, res, next) => {
  try {
    const bookId = Number(req.params.bookId);
    const data = await cartService.removeItem(getSessionId(req), bookId);
    sendSuccess(res, data);
  } catch (err) {
    if (err.statusCode) return sendError(res, err.message, err.code, err.statusCode);
    next(err);
  }
};

// ── DELETE /api/cart ──────────────────────────────────────────────────────────
export const clearCart = async (req, res, next) => {
  try {
    const data = await cartService.clearCart(getSessionId(req));
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/cart/validate ───────────────────────────────────────────────────
export const validateCart = async (req, res, next) => {
  try {
    const { items } = req.body;
    const result = await cartService.validateCart(items);
    sendSuccess(res, result);
  } catch (err) {
    if (err.message?.includes('not found')) return sendError(res, err.message, 'BOOK_NOT_FOUND', 400);
    next(err);
  }
};

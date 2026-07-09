import * as cartRepo from '../repositories/cart.repository.js';
import * as bookRepo from '../repositories/book.repository.js';
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_COST } from '../utils/constants.js';

/**
 * Business logic for the persistent server-side cart.
 *
 * Design:
 *  - Each browser session holds a UUID (session_id) in localStorage.
 *  - The session_id is sent in every cart request as X-Session-Id header.
 *  - The server does a find-or-create on the carts table.
 *  - No authentication required.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the totals envelope used in every cart response.
 */
const buildTotals = (items) => {
  const subtotal = parseFloat(
    items.reduce((sum, i) => sum + i.book.price * i.quantity, 0).toFixed(2)
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
  const total    = parseFloat((subtotal + shipping).toFixed(2));
  return { subtotal, shipping, total };
};

// ─────────────────────────────────────────────────────────────────────────────
// Public service methods
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/cart
 * Return all items in the session cart plus computed totals.
 */
export const getCart = async (sessionId) => {
  const cartId = await cartRepo.findOrCreateCart(sessionId);
  const items  = await cartRepo.getCartItems(cartId);
  return { items, ...buildTotals(items) };
};

/**
 * POST /api/cart/items  { bookId, quantity }
 * Add a book or increment its quantity.
 * Validates that the book exists before inserting.
 */
export const addItem = async (sessionId, bookId, quantity = 1) => {
  // Confirm book exists
  const book = await bookRepo.findById(bookId);
  if (!book) throw new Error(`Book with id ${bookId} not found`);

  const cartId = await cartRepo.findOrCreateCart(sessionId);
  await cartRepo.upsertCartItem(cartId, bookId, quantity);

  // Return updated cart
  return getCart(sessionId);
};

/**
 * PUT /api/cart/items/:bookId  { quantity }
 * Set an exact quantity (>= 1). Use DELETE to remove.
 */
export const updateItem = async (sessionId, bookId, quantity) => {
  const cart = await cartRepo.findCartBySession(sessionId);
  if (!cart) throw Object.assign(new Error('Cart not found'), { statusCode: 404, code: 'CART_NOT_FOUND' });

  const affected = await cartRepo.setCartItemQuantity(cart.id, bookId, quantity);
  if (!affected) throw Object.assign(
    new Error(`Item with bookId ${bookId} not found in cart`),
    { statusCode: 404, code: 'CART_ITEM_NOT_FOUND' }
  );

  return getCart(sessionId);
};

/**
 * DELETE /api/cart/items/:bookId
 * Remove a single book from the cart.
 */
export const removeItem = async (sessionId, bookId) => {
  const cart = await cartRepo.findCartBySession(sessionId);
  if (!cart) throw Object.assign(new Error('Cart not found'), { statusCode: 404, code: 'CART_NOT_FOUND' });

  await cartRepo.removeCartItem(cart.id, bookId);
  return getCart(sessionId);
};

/**
 * DELETE /api/cart
 * Clear all items (called after order is placed).
 */
export const clearCart = async (sessionId) => {
  const cart = await cartRepo.findCartBySession(sessionId);
  if (cart) await cartRepo.clearCart(cart.id);
  return { items: [], subtotal: 0, shipping: 0, total: 0 };
};

/**
 * POST /api/cart/validate
 * Re-confirm current server prices without mutating the cart.
 * Kept from the original stateless validate — still used by CheckoutComponent.
 */
export const validateCart = async (items) => {
  const bookIds = items.map((i) => Number(i.bookId));
  const books   = await bookRepo.findByIds(bookIds);
  const bookMap = new Map(books.map((b) => [b.id, b]));

  const validatedItems = [];
  for (const item of items) {
    const book = bookMap.get(Number(item.bookId));
    if (!book) throw new Error(`Book with id ${item.bookId} not found`);
    const qty       = Number(item.quantity);
    const lineTotal = parseFloat((book.price * qty).toFixed(2));
    validatedItems.push({
      bookId:    book.id,
      title:     book.title,
      quantity:  qty,
      price:     parseFloat(book.price.toFixed(2)),
      lineTotal,
    });
  }

  const subtotal = parseFloat(
    validatedItems.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2)
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
  const total    = parseFloat((subtotal + shipping).toFixed(2));

  return { valid: true, items: validatedItems, subtotal, shipping, total };
};

import pool from '../config/db.js';

/**
 * All raw SQL operations for carts and cart_items.
 * Uses parameterized queries exclusively — no string interpolation.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map a raw joined row → CartItem response shape.
 * Expected columns: book_id, quantity, added_at, updated_at,
 *   + all book columns prefixed naturally from the JOIN.
 */
const mapCartItem = (row) => ({
  bookId:        row.book_id,
  quantity:      row.quantity,
  addedAt:       row.added_at,
  updatedAt:     row.updated_at,
  book: {
    id:            row.id,
    title:         row.title,
    author:        row.author,
    price:         parseFloat(row.price),
    coverImage:    row.cover_image,
    category:      row.category,
    description:   row.description,
    rating:        parseFloat(row.rating),
    pages:         row.pages,
    publisher:     row.publisher,
    publishedDate: row.published_date,
    featured:      Boolean(row.featured),
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Cart lifecycle
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find an existing cart by session_id.
 * Returns { id, session_id } or null.
 */
export const findCartBySession = async (sessionId) => {
  const [rows] = await pool.query(
    'SELECT id, session_id FROM carts WHERE session_id = ?',
    [sessionId]
  );
  return rows.length ? rows[0] : null;
};

/**
 * Insert a new cart row for a session_id.
 * Returns the new cart id.
 */
export const createCart = async (sessionId) => {
  const [result] = await pool.query(
    'INSERT INTO carts (session_id) VALUES (?)',
    [sessionId]
  );
  return result.insertId;
};

/**
 * Find or create a cart for the given session_id.
 * Returns the cart id (number).
 */
export const findOrCreateCart = async (sessionId) => {
  const existing = await findCartBySession(sessionId);
  if (existing) return existing.id;
  return createCart(sessionId);
};

// ─────────────────────────────────────────────────────────────────────────────
// Cart items — reads
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all items in a cart (joined with book data).
 */
export const getCartItems = async (cartId) => {
  const [rows] = await pool.query(
    `SELECT
       ci.book_id,
       ci.quantity,
       ci.added_at,
       ci.updated_at,
       b.id,
       b.title,
       b.author,
       b.price,
       b.cover_image,
       b.category,
       b.description,
       b.rating,
       b.pages,
       b.publisher,
       b.published_date,
       b.featured
     FROM cart_items ci
     JOIN books b ON b.id = ci.book_id
     WHERE ci.cart_id = ?
     ORDER BY ci.added_at ASC`,
    [cartId]
  );
  return rows.map(mapCartItem);
};

/**
 * Get a single cart_items row (no book join).
 */
export const getCartItem = async (cartId, bookId) => {
  const [rows] = await pool.query(
    'SELECT id, cart_id, book_id, quantity FROM cart_items WHERE cart_id = ? AND book_id = ?',
    [cartId, bookId]
  );
  return rows.length ? rows[0] : null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Cart items — writes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Add a book to the cart, or increment quantity if it already exists.
 * Uses INSERT ... ON DUPLICATE KEY UPDATE for atomicity.
 */
export const upsertCartItem = async (cartId, bookId, quantityToAdd = 1) => {
  await pool.query(
    `INSERT INTO cart_items (cart_id, book_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       quantity = quantity + VALUES(quantity),
       updated_at = CURRENT_TIMESTAMP`,
    [cartId, bookId, quantityToAdd]
  );
};

/**
 * Set the exact quantity for a cart item.
 * Caller must ensure quantity >= 1 (remove instead if qty = 0).
 */
export const setCartItemQuantity = async (cartId, bookId, quantity) => {
  const [result] = await pool.query(
    `UPDATE cart_items
     SET quantity = ?, updated_at = CURRENT_TIMESTAMP
     WHERE cart_id = ? AND book_id = ?`,
    [quantity, cartId, bookId]
  );
  return result.affectedRows;   // 0 = item not found
};

/**
 * Remove a single item from the cart.
 */
export const removeCartItem = async (cartId, bookId) => {
  const [result] = await pool.query(
    'DELETE FROM cart_items WHERE cart_id = ? AND book_id = ?',
    [cartId, bookId]
  );
  return result.affectedRows;   // 0 = item not found
};

/**
 * Remove all items from a cart (used after order is placed).
 */
export const clearCart = async (cartId) => {
  await pool.query(
    'DELETE FROM cart_items WHERE cart_id = ?',
    [cartId]
  );
};

import pool from '../config/db.js';

/**
 * Raw SQL operations for orders and order_items.
 */

/**
 * Insert a new order and its items inside a transaction.
 * Returns the newly created order ID.
 */
export const createOrder = async ({ customerName, customerEmail, subtotal, shipping, total, items }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert order header
    const [orderResult] = await connection.query(
      `INSERT INTO orders (customer_name, customer_email, subtotal, shipping, total)
       VALUES (?, ?, ?, ?, ?)`,
      [customerName || null, customerEmail || null, subtotal, shipping, total]
    );
    const orderId = orderResult.insertId;

    // 2. Insert all order items
    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (order_id, book_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.bookId, item.quantity, item.unitPrice]
      );
    }

    await connection.commit();
    return orderId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

/**
 * Fetch a full order with its items and book titles.
 */
export const findOrderById = async (id) => {
  // Fetch order header
  const [orderRows] = await pool.query(
    'SELECT * FROM orders WHERE id = ?',
    [id]
  );
  if (!orderRows.length) return null;
  const order = orderRows[0];

  // Fetch order items joined with book title
  const [itemRows] = await pool.query(
    `SELECT oi.book_id, oi.quantity, oi.unit_price, b.title
     FROM order_items oi
     JOIN books b ON b.id = oi.book_id
     WHERE oi.order_id = ?`,
    [id]
  );

  return {
    orderId:       order.id,
    customerName:  order.customer_name,
    customerEmail: order.customer_email,
    status:        order.status,
    subtotal:      parseFloat(order.subtotal),
    shipping:      parseFloat(order.shipping),
    total:         parseFloat(order.total),
    createdAt:     order.created_at,
    items: itemRows.map((row) => ({
      bookId:    row.book_id,
      title:     row.title,
      quantity:  row.quantity,
      unitPrice: parseFloat(row.unit_price),
    })),
  };
};

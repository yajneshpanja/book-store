import * as bookRepo  from '../repositories/book.repository.js';
import * as orderRepo from '../repositories/order.repository.js';
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_COST } from '../utils/constants.js';

/**
 * Business logic for placing and retrieving orders.
 */

/**
 * Place an order:
 * 1. Look up all books by ID to confirm existence and capture current prices.
 * 2. Compute subtotal, shipping, total.
 * 3. Persist order + order_items in a transaction.
 * 4. Return the complete order confirmation.
 */
export const placeOrder = async ({ items, customerName, customerEmail }) => {
  const bookIds = items.map((i) => Number(i.bookId));
  const books   = await bookRepo.findByIds(bookIds);

  // Validate every book exists
  const bookMap = new Map(books.map((b) => [b.id, b]));
  for (const item of items) {
    if (!bookMap.has(Number(item.bookId))) {
      throw new Error(`Book with id ${item.bookId} not found`);
    }
  }

  // Build enriched items array with snapshotted unit prices
  const enrichedItems = items.map((item) => {
    const book = bookMap.get(Number(item.bookId));
    return {
      bookId:    book.id,
      quantity:  Number(item.quantity),
      unitPrice: book.price,   // snapshot at time of order
    };
  });

  // Calculate totals
  const subtotal = parseFloat(
    enrichedItems
      .reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
      .toFixed(2)
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
  const total    = parseFloat((subtotal + shipping).toFixed(2));

  // Persist to DB
  const orderId = await orderRepo.createOrder({
    customerName:  customerName  || null,
    customerEmail: customerEmail || null,
    subtotal,
    shipping,
    total,
    items: enrichedItems,
  });

  // Return confirmation envelope matching Angular frontend expectations
  return {
    orderId,
    status:    'confirmed',
    subtotal,
    shipping,
    total,
    createdAt: new Date().toISOString(),
    items: enrichedItems.map((i) => ({
      bookId:    i.bookId,
      title:     bookMap.get(i.bookId).title,
      quantity:  i.quantity,
      unitPrice: i.unitPrice,
    })),
  };
};

/**
 * Retrieve a full order by ID.
 */
export const getOrderById = async (id) => {
  return orderRepo.findOrderById(id);
};

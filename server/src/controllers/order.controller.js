import * as orderService from '../services/order.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createError } from '../middlewares/errorHandler.js';

/**
 * Controller for order endpoints.
 */

export const createOrder = async (req, res, next) => {
  try {
    const { items, customerName, customerEmail } = req.body;
    const order = await orderService.placeOrder({ items, customerName, customerEmail });
    sendSuccess(res, order, 201);
  } catch (error) {
    // If a book is missing, send 400 with clear error
    if (error.message.includes('not found')) {
      return sendError(res, error.message, 'BOOK_NOT_FOUND', 400);
    }
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(parseInt(id, 10));
    if (!order) {
      throw createError('Order not found', 'ORDER_NOT_FOUND', 404);
    }
    sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
};

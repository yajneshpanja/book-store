import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import { validateCreateOrder, validateOrderId } from '../validators/order.validator.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

/**
 * POST /api/orders     — place a new order
 * GET  /api/orders/:id — get order by ID
 */

router.post('/', validateCreateOrder, validate, orderController.createOrder);
router.get('/:id', validateOrderId, validate, orderController.getOrderById);

export default router;

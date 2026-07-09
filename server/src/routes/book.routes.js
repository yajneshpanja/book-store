import express from 'express';
import * as bookController from '../controllers/book.controller.js';
import { validateBookId } from '../validators/book.validator.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

/**
 * GET  /api/books                — list all (search, filter, pagination)
 * GET  /api/books/featured       — get featured books
 * GET  /api/books/categories     — get distinct categories
 * GET  /api/books/:id            — get single book
 * GET  /api/books/:id/related    — get related books
 */

router.get('/', bookController.listBooks);
router.get('/featured', bookController.getFeatured);
router.get('/categories', bookController.getCategories);
router.get('/:id', validateBookId, validate, bookController.getBookById);
router.get('/:id/related', validateBookId, validate, bookController.getRelated);

export default router;

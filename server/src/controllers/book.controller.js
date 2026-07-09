import * as bookService from '../services/book.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createError } from '../middlewares/errorHandler.js';

/**
 * Controller for books endpoints.
 * Thin layer — calls service, wraps in response helpers.
 */

export const listBooks = async (req, res, next) => {
  try {
    const { q = '', category = '', page = 1, limit = 8 } = req.query;
    const filters = {
      q,
      category,
      page: Math.max(1, parseInt(page, 10)),
      limit: Math.min(50, Math.max(1, parseInt(limit, 10))), // cap at 50
    };
    const data = await bookService.getBooks(filters);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getFeatured = async (_req, res, next) => {
  try {
    const books = await bookService.getFeaturedBooks();
    sendSuccess(res, { books });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (_req, res, next) => {
  try {
    const categories = await bookService.getCategories();
    sendSuccess(res, { categories });
  } catch (error) {
    next(error);
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const book = await bookService.getBookById(parseInt(id, 10));
    if (!book) {
      throw createError('Book not found', 'BOOK_NOT_FOUND', 404);
    }
    sendSuccess(res, { book });
  } catch (error) {
    next(error);
  }
};

export const getRelated = async (req, res, next) => {
  try {
    const { id } = req.params;
    const books = await bookService.getRelatedBooks(parseInt(id, 10));
    sendSuccess(res, { books });
  } catch (error) {
    next(error);
  }
};

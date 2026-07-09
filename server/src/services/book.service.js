import * as bookRepo from '../repositories/book.repository.js';

/**
 * Business logic for books.
 */

/**
 * List books — delegates to repo, wraps with pagination envelope.
 */
export const getBooks = async ({ q, category, page, limit }) => {
  const { rows, total } = await bookRepo.findAll({ q, category, page, limit });
  return {
    books: rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Featured books for the home page (up to 6).
 */
export const getFeaturedBooks = async () => {
  return bookRepo.findFeatured();
};

/**
 * Distinct category list (alphabetical).
 */
export const getCategories = async () => {
  return bookRepo.findCategories();
};

/**
 * Single book by ID — returns null if not found.
 */
export const getBookById = async (id) => {
  return bookRepo.findById(id);
};

/**
 * Related books — same category, excluding the source book.
 */
export const getRelatedBooks = async (bookId) => {
  const book = await bookRepo.findById(bookId);
  if (!book) return [];
  return bookRepo.findRelated(bookId, book.category);
};

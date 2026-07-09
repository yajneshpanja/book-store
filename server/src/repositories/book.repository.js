import pool from '../config/db.js';

/**
 * Raw SQL operations for books.
 * All queries use parameterized statements — no string interpolation.
 */

/**
 * Map a raw DB row → Book object (camelCase, correct types).
 * mysql2 returns DECIMAL as string and DATE as string (dateStrings:true).
 */
const mapBook = (row) => ({
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
  publishedDate: row.published_date,      // already 'YYYY-MM-DD' due to dateStrings:true
  featured:      Boolean(row.featured),
});

/**
 * List books with optional search, category filter, and pagination.
 */
export const findAll = async ({ q, category, page, limit }) => {
  const offset    = (page - 1) * limit;
  const params    = [];
  const conditions = [];

  if (q) {
    conditions.push('(title LIKE ? OR author LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count (for pagination)
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM books ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  // Get paginated rows
  const [rows] = await pool.query(
    `SELECT * FROM books ${whereClause} ORDER BY id ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { rows: rows.map(mapBook), total };
};

/**
 * Get up to 6 featured books.
 */
export const findFeatured = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM books WHERE featured = 1 ORDER BY id ASC LIMIT 6'
  );
  return rows.map(mapBook);
};

/**
 * Get distinct categories (sorted alphabetically).
 */
export const findCategories = async () => {
  const [rows] = await pool.query(
    'SELECT DISTINCT category FROM books ORDER BY category ASC'
  );
  return rows.map((r) => r.category);
};

/**
 * Get a single book by ID.
 */
export const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM books WHERE id = ?',
    [id]
  );
  return rows.length ? mapBook(rows[0]) : null;
};

/**
 * Get up to 4 books in the same category, excluding the source book.
 */
export const findRelated = async (bookId, category) => {
  const [rows] = await pool.query(
    `SELECT * FROM books
     WHERE category = ? AND id != ?
     ORDER BY id ASC
     LIMIT 4`,
    [category, bookId]
  );
  return rows.map(mapBook);
};

/**
 * Find multiple books by an array of IDs.
 * Used by cart validate and order service.
 */
export const findByIds = async (ids) => {
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(', ');
  const [rows] = await pool.query(
    `SELECT * FROM books WHERE id IN (${placeholders})`,
    ids
  );
  return rows.map(mapBook);
};

import { Book } from './book.model';

// ─────────────────────────────────────────────────────────────────────────────
// Persistent Cart types  (GET/POST/PUT/DELETE /api/cart/*)
// ─────────────────────────────────────────────────────────────────────────────

/** A single item returned by GET /api/cart (includes full Book object) */
export interface ServerCartItem {
  bookId:    number;
  quantity:  number;
  addedAt:   string;
  updatedAt: string;
  book:      Book;
}

/**
 * Response shape for all cart mutation endpoints:
 *   GET    /api/cart
 *   POST   /api/cart/items
 *   PUT    /api/cart/items/:bookId
 *   DELETE /api/cart/items/:bookId
 *   DELETE /api/cart
 */
export interface CartResponse {
  items:    ServerCartItem[];
  subtotal: number;
  shipping: number;
  total:    number;
}

/** Request body for POST /api/cart/items */
export interface AddCartItemRequest {
  bookId:   number;
  quantity?: number;
}

/** Request body for PUT /api/cart/items/:bookId */
export interface UpdateCartItemRequest {
  quantity: number;
}

/** Standard envelope wrapping every API response */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}

/** Pagination metadata returned by GET /api/books */
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Response shape for GET /api/books */
export interface BooksResponse {
  books: Book[];
  pagination: Pagination;
}

/** Response shape for GET /api/books/featured and related */
export interface BookListResponse {
  books: Book[];
}

/** Response shape for GET /api/books/:id */
export interface SingleBookResponse {
  book: Book;
}

/** Response shape for GET /api/books/categories */
export interface CategoriesResponse {
  categories: string[];
}

/** Cart validation request item */
export interface CartRequestItem {
  bookId: number;
  quantity: number;
}

/** Validated item returned by POST /api/cart/validate */
export interface ValidatedCartItem {
  bookId: number;
  title: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

/** Response shape for POST /api/cart/validate */
export interface CartValidateResponse {
  valid: boolean;
  items: ValidatedCartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth types  (POST /api/auth/login)
// ─────────────────────────────────────────────────────────────────────────────
export { LoginRequest, AuthUser, LoginResponse } from './auth.model';

/** Order item returned in order responses */
export interface OrderItemResponse {
  bookId: number;
  title: string;
  quantity: number;
  unitPrice: number;
}

/** Response shape for POST /api/orders */
export interface OrderResponse {
  orderId: number;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  items: OrderItemResponse[];
}

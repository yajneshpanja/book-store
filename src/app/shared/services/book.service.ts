import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book, Category } from '../models/book.model';
import {
  ApiResponse,
  BooksResponse,
  BookListResponse,
  SingleBookResponse,
  CategoriesResponse,
  Pagination,
} from '../models/api.model';

const BASE = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class BookService {
  private http = inject(HttpClient);

  // ── Reactive state ─────────────────────────────────────────────────────────
  /** All books loaded into local Signal state (populated lazily on first call) */
  readonly books = signal<Book[]>([]);

  /** Distinct categories — derived from loaded books if available, else fetched */
  readonly categories = computed<Category[]>(() => {
    const cats = this.books().map((b) => b.category);
    return [...new Set(cats)] as Category[];
  });

  // ── Loading & error state (optional — consume in components if needed) ─────
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  // ── Pagination metadata from last list call ────────────────────────────────
  readonly pagination = signal<Pagination | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // Public API (same surface as the previous mock version)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Fetch all books with optional search, category and pagination.
   * Updates `this.books` signal and returns the raw page of results.
   */
  async fetchBooks(params: {
    q?: string;
    category?: Category | '';
    page?: number;
    limit?: number;
  } = {}): Promise<{ books: Book[]; pagination: Pagination }> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let httpParams = new HttpParams();
      if (params.q)        httpParams = httpParams.set('q',        params.q);
      if (params.category) httpParams = httpParams.set('category', params.category);
      if (params.page)     httpParams = httpParams.set('page',     String(params.page));
      if (params.limit)    httpParams = httpParams.set('limit',    String(params.limit));

      const res = await firstValueFrom(
        this.http.get<ApiResponse<BooksResponse>>(`${BASE}/books`, { params: httpParams })
      );
      this.books.set(res.data.books);
      this.pagination.set(res.data.pagination);
      return res.data;
    } catch (err: unknown) {
      const msg = (err as Error).message ?? 'Failed to load books';
      this.error.set(msg);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Returns the first 6 featured books from the API.
   * Mirrors the old getFeatured() method.
   */
  async getFeatured(): Promise<Book[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<BookListResponse>>(`${BASE}/books/featured`)
    );
    return res.data.books;
  }

  /**
   * Fetch distinct categories list from API.
   */
  async fetchCategories(): Promise<Category[]> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<CategoriesResponse>>(`${BASE}/books/categories`)
    );
    return res.data.categories as Category[];
  }

  /**
   * Fetch a single book by ID.
   * Returns undefined if 404 (matching old getBook() contract).
   */
  async getBook(id: number): Promise<Book | undefined> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<SingleBookResponse>>(`${BASE}/books/${id}`)
      );
      return res.data.book;
    } catch {
      return undefined;
    }
  }

  /**
   * Fetch up to 4 related books for a given book ID.
   */
  async getRelated(bookId: number): Promise<Book[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<BookListResponse>>(`${BASE}/books/${bookId}/related`)
      );
      return res.data.books;
    } catch {
      return [];
    }
  }

  /**
   * Synchronous in-memory search — used by BooksComponent for instant filtering
   * while waiting for API results or as a fallback.
   */
  searchBooks(query: string, category: Category | '' = ''): Book[] {
    const q = query.trim().toLowerCase();
    return this.books().filter((b) => {
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q);
      const matchesCategory = !category || b.category === category;
      return matchesQuery && matchesCategory;
    });
  }
}

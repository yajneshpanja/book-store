import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book } from '../models/book.model';
import { CartItem } from '../models/cart-item.model';
import {
  ApiResponse,
  CartResponse,
  CartValidateResponse,
  OrderResponse,
} from '../models/api.model';
import { AuthService } from './auth.service';

const BASE = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class CartService {
  private http        = inject(HttpClient);
  private authService = inject(AuthService);

  // ── Local Signal state (kept in sync with server after every mutation) ──────
  readonly cartItems = signal<CartItem[]>([]);

  readonly itemCount = computed<number>(() =>
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly totalPrice = computed<number>(() =>
    this.cartItems().reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0
    )
  );

  readonly shippingCost = computed<number>(() =>
    this.totalPrice() >= 50 ? 0 : 4.99
  );

  readonly grandTotal = computed<number>(() =>
    this.totalPrice() + this.shippingCost()
  );

  // ── HTTP header helper ───────────────────────────────────────────────────────
  /**
   * Build headers with the JWT Bearer token.
   * Every cart request is now authenticated.
   */
  private headers(): HttpHeaders {
    const token = this.authService.token();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  /**
   * Map server CartResponse items → local CartItem[] Signal shape.
   */
  private applyServerCart(response: CartResponse): void {
    const items: CartItem[] = response.items.map((si) => ({
      book:     si.book,
      quantity: si.quantity,
    }));
    this.cartItems.set(items);
  }

  // ── Initialisation ───────────────────────────────────────────────────────────

  /**
   * Load the cart from the server.
   * Called after login (and optionally on app start when already logged in).
   * Silently ignores errors — UI still works with local state.
   */
  async loadCart(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      this.cartItems.set([]);
      return;
    }
    try {
      const res = await firstValueFrom(
        this.http.get<ApiResponse<CartResponse>>(`${BASE}/cart`, {
          headers: this.headers(),
        })
      );
      this.applyServerCart(res.data);
    } catch {
      // Network error — cart stays empty locally
    }
  }

  /**
   * Clear the local cart signal (called on logout — no server call needed
   * because the server cart persists for next login).
   */
  clearLocalCart(): void {
    this.cartItems.set([]);
  }

  // ── CRUD operations ──────────────────────────────────────────────────────────

  async addToCart(book: Book): Promise<void> {
    if (!this.authService.isLoggedIn()) return;
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<CartResponse>>(
          `${BASE}/cart/items`,
          { bookId: book.id, quantity: 1 },
          { headers: this.headers() }
        )
      );
      this.applyServerCart(res.data);
    } catch {
      // Optimistic fallback
      const current  = this.cartItems();
      const existing = current.find((i) => i.book.id === book.id);
      if (existing) {
        this.cartItems.set(
          current.map((i) =>
            i.book.id === book.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        );
      } else {
        this.cartItems.set([...current, { book, quantity: 1 }]);
      }
    }
  }

  async removeFromCart(bookId: number): Promise<void> {
    if (!this.authService.isLoggedIn()) return;
    try {
      const res = await firstValueFrom(
        this.http.delete<ApiResponse<CartResponse>>(
          `${BASE}/cart/items/${bookId}`,
          { headers: this.headers() }
        )
      );
      this.applyServerCart(res.data);
    } catch {
      this.cartItems.set(this.cartItems().filter((i) => i.book.id !== bookId));
    }
  }

  async updateQuantity(bookId: number, quantity: number): Promise<void> {
    if (quantity <= 0) return this.removeFromCart(bookId);
    if (!this.authService.isLoggedIn()) return;
    try {
      const res = await firstValueFrom(
        this.http.put<ApiResponse<CartResponse>>(
          `${BASE}/cart/items/${bookId}`,
          { quantity },
          { headers: this.headers() }
        )
      );
      this.applyServerCart(res.data);
    } catch {
      this.cartItems.set(
        this.cartItems().map((i) =>
          i.book.id === bookId ? { ...i, quantity } : i
        )
      );
    }
  }

  async clearCart(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      this.cartItems.set([]);
      return;
    }
    try {
      await firstValueFrom(
        this.http.delete<ApiResponse<CartResponse>>(`${BASE}/cart`, {
          headers: this.headers(),
        })
      );
    } catch {
      // Ignore — still clear locally
    } finally {
      this.cartItems.set([]);
    }
  }

  // ── Price validation ─────────────────────────────────────────────────────────

  async validateCart(): Promise<CartValidateResponse> {
    const items = this.cartItems().map((i) => ({
      bookId:   i.book.id,
      quantity: i.quantity,
    }));
    const res = await firstValueFrom(
      this.http.post<ApiResponse<CartValidateResponse>>(
        `${BASE}/cart/validate`,
        { items },
        { headers: this.headers() }
      )
    );
    return res.data;
  }

  // ── Order placement ──────────────────────────────────────────────────────────

  async placeOrder(customerName?: string, customerEmail?: string): Promise<OrderResponse> {
    const items = this.cartItems().map((i) => ({
      bookId:   i.book.id,
      quantity: i.quantity,
    }));
    const res = await firstValueFrom(
      this.http.post<ApiResponse<OrderResponse>>(
        `${BASE}/orders`,
        { items, customerName, customerEmail },
        { headers: this.headers() }
      )
    );
    return res.data;
  }
}

import { Injectable, signal, computed } from '@angular/core';
import { Book } from '../models/book.model';
import { CartItem } from '../models/cart-item.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  /** Reactive cart state */
  readonly cartItems = signal<CartItem[]>([]);

  /** Total number of individual items in the cart */
  readonly itemCount = computed<number>(() =>
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  /** Subtotal price across all cart items */
  readonly totalPrice = computed<number>(() =>
    this.cartItems().reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0
    )
  );

  /** Shipping: free over $50, otherwise flat $4.99 */
  readonly shippingCost = computed<number>(() =>
    this.totalPrice() >= 50 ? 0 : 4.99
  );

  /** Grand total including shipping */
  readonly grandTotal = computed<number>(() =>
    this.totalPrice() + this.shippingCost()
  );

  /** Add a book to the cart. If it already exists, increment quantity by 1. */
  addToCart(book: Book): void {
    const current = this.cartItems();
    const existing = current.find((item) => item.book.id === book.id);
    if (existing) {
      this.cartItems.set(
        current.map((item) =>
          item.book.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      this.cartItems.set([...current, { book, quantity: 1 }]);
    }
  }

  /** Remove a book from the cart entirely. */
  removeFromCart(bookId: number): void {
    this.cartItems.set(
      this.cartItems().filter((item) => item.book.id !== bookId)
    );
  }

  /** Update quantity for an item. Removes item if qty drops to 0. */
  updateQuantity(bookId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(bookId);
      return;
    }
    this.cartItems.set(
      this.cartItems().map((item) =>
        item.book.id === bookId ? { ...item, quantity } : item
      )
    );
  }

  /** Clear the entire cart (used after placing an order). */
  clearCart(): void {
    this.cartItems.set([]);
  }
}

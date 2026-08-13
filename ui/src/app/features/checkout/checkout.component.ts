import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../shared/services/cart.service';
import { ValidatedCartItem } from '../../shared/models/api.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private router      = inject(Router);
  private snackBar    = inject(MatSnackBar);

  // ── Cart state from service ────────────────────────────────────────────────
  readonly cartItems    = this.cartService.cartItems;
  readonly itemCount    = this.cartService.itemCount;

  // ── Validation state ───────────────────────────────────────────────────────
  /** null = not yet validated; array = validated items from backend */
  readonly validatedItems  = signal<ValidatedCartItem[] | null>(null);
  readonly validating      = signal(false);
  readonly validationError = signal<string | null>(null);

  /** Validated totals (from backend) — fall back to local computed values */
  readonly validatedSubtotal = signal<number | null>(null);
  readonly validatedShipping = signal<number | null>(null);
  readonly validatedTotal    = signal<number | null>(null);

  /** True when at least one item's server price differs from local price */
  readonly hasPriceChange = computed(() => {
    const validated = this.validatedItems();
    if (!validated) return false;
    return validated.some((vi) => {
      const localItem = this.cartItems().find((ci) => ci.book.id === vi.bookId);
      return localItem && Math.abs(localItem.book.price - vi.price) > 0.001;
    });
  });

  // Display totals — use server values once validated, else local computed
  readonly displaySubtotal = computed(() =>
    this.validatedSubtotal() ?? this.cartService.totalPrice()
  );
  readonly displayShipping = computed(() =>
    this.validatedShipping() ?? this.cartService.shippingCost()
  );
  readonly displayTotal = computed(() =>
    this.validatedTotal() ?? this.cartService.grandTotal()
  );

  // ── Order placement state ──────────────────────────────────────────────────
  readonly placing = signal(false);

  /** Placement is only enabled once validation succeeds */
  readonly canPlaceOrder = computed(
    () => this.validatedItems() !== null && !this.validating() && !this.placing()
  );

  // ─────────────────────────────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    if (this.cartItems().length > 0) {
      await this.runValidation();
    }
  }

  /** Call POST /api/cart/validate and update validated signals */
  async runValidation(): Promise<void> {
    this.validating.set(true);
    this.validationError.set(null);
    try {
      const result = await this.cartService.validateCart();
      this.validatedItems.set(result.items);
      this.validatedSubtotal.set(result.subtotal);
      this.validatedShipping.set(result.shipping);
      this.validatedTotal.set(result.total);

      if (this.hasPriceChange()) {
        this.snackBar.open(
          '⚠️ Some prices have been updated. Please review before placing your order.',
          'OK',
          { duration: 6000 }
        );
      }
    } catch {
      this.validationError.set(
        'Could not verify cart with the server. You can still try placing the order.'
      );
    } finally {
      this.validating.set(false);
    }
  }

  /** Look up the server-confirmed price for a book (falls back to local price) */
  getValidatedPrice(bookId: number): number {
    return this.validatedItems()?.find((v) => v.bookId === bookId)?.price
      ?? this.cartItems().find((c) => c.book.id === bookId)?.book.price
      ?? 0;
  }

  /** Returns true if the server price differs from the local price for a book */
  isPriceChanged(bookId: number): boolean {
    const vi = this.validatedItems()?.find((v) => v.bookId === bookId);
    if (!vi) return false;
    const local = this.cartItems().find((c) => c.book.id === bookId)?.book.price ?? vi.price;
    return Math.abs(local - vi.price) > 0.001;
  }

  async placeOrder(): Promise<void> {
    if (!this.canPlaceOrder()) return;
    this.placing.set(true);
    try {
      await this.cartService.placeOrder();
      this.cartService.clearCart();
      this.snackBar.open(
        '🎉 Order placed successfully! Thank you for shopping with us.',
        'Close',
        { duration: 5000, panelClass: 'snack-success' }
      );
      this.router.navigate(['/']);
    } catch {
      this.snackBar.open(
        'Failed to place order. Please try again.',
        'Dismiss',
        { duration: 4000 }
      );
    } finally {
      this.placing.set(false);
    }
  }
}

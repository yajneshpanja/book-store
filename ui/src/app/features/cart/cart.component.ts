import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from '../../shared/services/cart.service';
import { CartItem } from '../../shared/models/cart-item.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  private cartService = inject(CartService);

  readonly cartItems = this.cartService.cartItems;
  readonly totalPrice = this.cartService.totalPrice;
  readonly shippingCost = this.cartService.shippingCost;
  readonly grandTotal = this.cartService.grandTotal;

  increment(item: CartItem): void {
    this.cartService.updateQuantity(item.book.id, item.quantity + 1);
  }

  decrement(item: CartItem): void {
    this.cartService.updateQuantity(item.book.id, item.quantity - 1);
  }

  remove(item: CartItem): void {
    this.cartService.removeFromCart(item.book.id);
  }
}

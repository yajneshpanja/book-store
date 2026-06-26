import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../shared/services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  private cartService = inject(CartService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  readonly cartItems = this.cartService.cartItems;
  readonly totalPrice = this.cartService.totalPrice;
  readonly shippingCost = this.cartService.shippingCost;
  readonly grandTotal = this.cartService.grandTotal;
  readonly itemCount = this.cartService.itemCount;

  placeOrder(): void {
    this.cartService.clearCart();
    this.snackBar.open(
      '🎉 Order placed successfully! Thank you for shopping with us.',
      'Close',
      { duration: 5000, panelClass: 'snack-success' }
    );
    this.router.navigate(['/']);
  }
}

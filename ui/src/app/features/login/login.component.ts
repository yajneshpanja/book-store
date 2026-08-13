import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../shared/services/auth.service';
import { CartService } from '../../shared/services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router      = inject(Router);

  email    = '';
  password = '';

  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly hidePassword = signal(true);

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.login(this.email, this.password);
      // Load the user's persistent server cart immediately after login
      await this.cartService.loadCart();
      this.router.navigate(['/']);
    } catch (err: unknown) {
      const msg =
        (err as { error?: { error?: { message?: string } } })?.error?.error?.message
        ?? 'Invalid email or password. Please try again.';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}

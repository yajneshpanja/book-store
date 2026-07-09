import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService {
  private authService = inject(AuthService);
  private router      = inject(Router);
  private snackBar    = inject(MatSnackBar);

  /**
   * Returns true if the user is logged in.
   * If not, shows a snackbar notification with a "Sign in" action that
   * navigates to /login, then returns false.
   *
   * Usage:
   *   if (!this.authGuard.requireLogin()) return;
   */
  requireLogin(): boolean {
    if (this.authService.isLoggedIn()) return true;

    this.snackBar
      .open('Please sign in to add items to your cart', 'Sign in', {
        duration: 4000,
        panelClass: 'snack-warn',
      })
      .onAction()
      .subscribe(() => this.router.navigate(['/login']));

    return false;
  }
}

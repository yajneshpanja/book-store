import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
  computed,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenav } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CartService } from '../../../shared/services/cart.service';
import { AuthService } from '../../../shared/services/auth.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private router      = inject(Router);
  private cartService = inject(CartService);
  readonly authService = inject(AuthService);

  @ViewChild('drawer') drawer!: MatSidenav;

  /** Reactive cart item count from CartService */
  readonly cartCount   = computed(() => this.cartService.itemCount());
  readonly isLoggedIn  = computed(() => this.authService.isLoggedIn());
  readonly currentUser = computed(() => this.authService.currentUser());

  searchQuery = '';
  private routerSub!: Subscription;

  ngOnInit(): void {
    // Close drawer on every navigation
    this.routerSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.drawer?.close());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  onSearch(): void {
    const q = this.searchQuery.trim();
    if (q) {
      this.router.navigate(['/books'], { queryParams: { q } });
      this.searchQuery = '';
    }
  }

  onLogout(): void {
    this.cartService.clearLocalCart();
    this.authService.logout();
  }
}

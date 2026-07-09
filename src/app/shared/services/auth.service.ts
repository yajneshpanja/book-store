import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { LoginRequest, LoginResponse, AuthUser } from '../models/auth.model';

const BASE      = environment.apiUrl;
const TOKEN_KEY = 'bks_auth_token';
const USER_KEY  = 'bks_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  // ── Reactive state ─────────────────────────────────────────────────────────
  private readonly _token = signal<string | null>(
    typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
  );

  private readonly _user = signal<AuthUser | null>(
    typeof localStorage !== 'undefined'
      ? (() => {
          const raw = localStorage.getItem(USER_KEY);
          return raw ? (JSON.parse(raw) as AuthUser) : null;
        })()
      : null
  );

  /** True when a valid token is present */
  readonly isLoggedIn = computed(() => this._token() !== null);

  /** Current logged-in user, or null */
  readonly currentUser = computed(() => this._user());

  /** The raw JWT (needed for Authorization headers) */
  readonly token = computed(() => this._token());

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Authenticate with email + password.
   * On success stores credentials in memory + localStorage.
   * The caller (LoginComponent) is responsible for loading the cart afterwards.
   */
  async login(email: string, password: string): Promise<void> {
    const body: LoginRequest = { email, password };
    const res = await firstValueFrom(
      this.http.post<ApiResponse<LoginResponse>>(`${BASE}/auth/login`, body)
    );
    const { token, user } = res.data;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  /**
   * Clear credentials and redirect to home.
   * The caller (NavbarComponent) is responsible for clearing the local cart.
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/']);
  }
}

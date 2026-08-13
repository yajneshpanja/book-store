/** Request body for POST /api/auth/login */
export interface LoginRequest {
  email:    string;
  password: string;
}

/** Public user data returned after login */
export interface AuthUser {
  id:    number;
  name:  string;
  email: string;
  role:  'user' | 'admin';
}

/** Response body for POST /api/auth/login */
export interface LoginResponse {
  token: string;
  user:  AuthUser;
}

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'books',
    loadComponent: () =>
      import('./features/books/books.component').then((m) => m.BooksComponent),
  },
  {
    path: 'books/:id',
    loadComponent: () =>
      import('./features/book-details/book-details.component').then(
        (m) => m.BookDetailsComponent
      ),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then(
        (m) => m.CheckoutComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

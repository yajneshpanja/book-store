# Bookstore Web Application — Implementation Plan

## Top-Level Overview

Build a minimal, modern, fully responsive bookstore SPA using Angular 21, Angular Material, SCSS,
and Standalone Components on a completely empty git repo. There is no backend; all data comes from
in-memory mock JSON. The app has five pages (Home, Books, Book Details, Cart, Checkout) with a
global Navbar and Footer. All UI must be responsive across Mobile (320–599px), Tablet (600–1023px),
Laptop (1024–1439px), and Desktop (≥1440px). Work proceeds step-by-step; each sub-task must be
reviewed and confirmed before moving to the next.

**Confirmed design decisions:**
- Checkout button navigates to `/checkout` (UI-only confirmation page, no form processing)
- Navbar search icon navigates to `/books?q=...`
- Material theme: Indigo + Pink (default prebuilt theme)

---

## Sub-Tasks

---

### Sub-Task 1 — Project Scaffold & Configuration

**Status:** [ ] pending

**Intent:**  
Bootstrap a fresh Angular 21 project with all required dependencies, global SCSS variables/mixins,
and correct `angular.json` / `tsconfig.json` so subsequent tasks can rely on a working build.

**Expected Outcomes:**
- `package.json` lists Angular 21, Angular Material, Angular CDK, Angular Animations, and standard
  Angular CLI devDependencies.
- `angular.json` configured with SCSS as default style, budget limits, and `src/styles.scss` as
  the global stylesheet.
- `tsconfig.json` with strict mode enabled.
- `src/styles.scss` declares CSS custom properties, SCSS variables (`$mobile`, `$tablet`,
  `$laptop`, `$desktop`), and responsive mixins (`respond-to`).
- `src/index.html` includes Material Icons CDN link and correct viewport meta tag.
- `src/main.ts` bootstraps the root `AppComponent` as a standalone component with
  `provideRouter`, `provideAnimations`, and `provideHttpClient`.
- `src/app/app.ts` — minimal standalone root component.
- `src/app/app.routes.ts` — placeholder routes file (populated later).
- The project compiles without errors (`ng build`).

**Todo List:**
1. Create `package.json` with Angular 21 + Angular Material + CDK + Animations + RxJS.
2. Create `angular.json` (project name `bookstore`, SCSS style, assets, build config).
3. Create `tsconfig.json` and `tsconfig.app.json` (strict, standalone defaults).
4. Create `src/index.html` with viewport meta, Material Icons CDN, and `<app-root>`.
5. Create `src/main.ts` with `bootstrapApplication` + providers.
6. Create `src/styles.scss` with CSS reset, Material theme import, SCSS variables and mixins.
7. Create `src/app/app.ts` (standalone, imports `RouterOutlet`).
8. Create `src/app/app.routes.ts` with empty routes array.

**Relevant Context:**
- Angular 21 uses `bootstrapApplication` (no `NgModule`).
- Angular Material theming: import pre-built theme in `styles.scss`
  (`@import '@angular/material/prebuilt-themes/indigo-pink.css'`).
- SCSS breakpoint variables and `respond-to` mixin are the shared styling contract used by all
  later components.

---

### Sub-Task 2 — Data Models & Mock Service

**Status:** [ ] pending

**Intent:**  
Define TypeScript interfaces and a single `BookService` that provides mock book data via Signals.
All feature components consume this service — no component should hold its own data.

**Expected Outcomes:**
- `src/app/shared/models/book.model.ts` exports `Book` and `Category` interfaces.
- `src/app/shared/models/cart-item.model.ts` exports `CartItem` interface.
- `src/app/shared/services/book.service.ts` exposes:
  - `books` Signal — array of 24 mock `Book` objects across ≥4 categories.
  - `getBook(id)` — returns a single book by ID.
  - `getFeatured()` — returns first 6 books.
  - `getRelated(id)` — returns 4 books in the same category.
  - `searchBooks(query, category)` — filtered result.
- `src/app/shared/services/cart.service.ts` exposes:
  - `cartItems` Signal — reactive cart state.
  - `addToCart(book)`, `removeFromCart(id)`, `updateQuantity(id, qty)`, `totalPrice` computed Signal.

**Todo List:**
1. Create `src/app/shared/models/book.model.ts`.
2. Create `src/app/shared/models/cart-item.model.ts`.
3. Create `src/app/shared/services/book.service.ts` with 24 mock books and all accessor methods.
4. Create `src/app/shared/services/cart.service.ts` with full cart Signal state.

**Relevant Context:**
- Use Angular Signals (`signal`, `computed`) — no BehaviorSubject.
- All services are `providedIn: 'root'` (tree-shakable).
- Mock data covers fields: `id`, `title`, `author`, `price`, `coverImage` (use
  `https://picsum.photos/seed/{id}/300/400`), `category`, `description`, `rating`, `pages`,
  `publisher`, `publishedDate`, `featured`.

---

### Sub-Task 3 — Global Layout: Navbar & Footer

**Status:** [ ] pending

**Intent:**  
Build the persistent shell — Navbar and Footer — that wrap every page. These are the first visual
components users see and establish the design language for the entire app.

**Expected Outcomes:**
- `src/app/core/layout/navbar/navbar.component.ts` (standalone):
  - Desktop: logo, nav links (Home, Books, Cart with badge), search icon.
  - Tablet: compact links.
  - Mobile: hamburger icon opens `MatDrawer` side nav with all links.
  - Cart badge shows reactive item count from `CartService`.
- `src/app/core/layout/footer/footer.component.ts` (standalone):
  - Simple footer with app name, copyright, and category quick-links.
  - Fully responsive single/multi-column layout.
- `src/app/app.ts` updated to include `<app-navbar>`, `<router-outlet>`, and `<app-footer>`.

**Todo List:**
1. Create `navbar.component.ts`, `navbar.component.html`, `navbar.component.scss`.
2. Implement hamburger drawer using `MatSidenav` + `MatToolbar`.
3. Add router links and reactive cart badge using `CartService.cartItems`.
4. Create `footer.component.ts`, `footer.component.html`, `footer.component.scss`.
5. Update `src/app/app.ts` to compose the shell layout.

**Relevant Context:**
- Use `MatToolbarModule`, `MatIconModule`, `MatButtonModule`, `MatSidenavModule`, `MatBadgeModule`.
- Navbar height: 64px desktop, 56px mobile.
- The drawer must close on navigation (subscribe to `Router.events`).
- Import `RouterLink`, `RouterLinkActive` in the navbar standalone component.

---

### Sub-Task 4 — Shared UI Components

**Status:** [ ] pending

**Intent:**  
Build the reusable leaf components used across multiple pages so feature pages only need to
compose them.

**Expected Outcomes:**
- `book-card` — displays cover, title, author, price, rating stars, and "Add to Cart" button.
  Emits `addToCart` output event. Responsive image with `object-fit: cover`.
- `hero-banner` — full-width banner with headline, subtitle, and CTA button. Background uses a
  gradient overlay on an image. Accepts `@Input` title/subtitle/ctaText/ctaLink.
- `search-bar` — controlled input with debounce (300 ms) that emits `search` event with string
  value. Uses `MatFormField`.
- `category-filter` — renders a row of `MatChip` buttons for category selection. Emits
  `categoryChange` event with selected category string.

**Todo List:**
1. Create `book-card` component (ts / html / scss).
2. Create `hero-banner` component (ts / html / scss).
3. Create `search-bar` component (ts / html / scss).
4. Create `category-filter` component (ts / html / scss).
5. Export all four from a `SharedModule` barrel (index.ts) — or use direct imports since they
   are standalone.

**Relevant Context:**
- All components are standalone.
- `book-card` must import `MatCardModule`, `MatButtonModule`, `MatIconModule`.
- `search-bar` should use `ReactiveFormsModule` (`FormControl`) + `debounceTime(300)`.
- `category-filter` uses `MatChipsModule`.
- `hero-banner` background: CSS linear-gradient overlay on a static hero image URL.

---

### Sub-Task 5 — Routing Configuration

**Status:** [ ] pending

**Intent:**  
Wire all five feature routes with lazy loading so the initial bundle stays small.

**Expected Outcomes:**
- `app.routes.ts` defines five lazy-loaded routes:
  - `/` → `HomeComponent`
  - `/books` → `BooksComponent`
  - `/books/:id` → `BookDetailsComponent`
  - `/cart` → `CartComponent`
  - `/checkout` → `CheckoutComponent`
  - `**` → redirect to `/`
- Each route uses `loadComponent` (standalone lazy loading).
- Navigation from Navbar links works correctly.

**Todo List:**
1. Update `src/app/app.routes.ts` with all five lazy routes using `loadComponent`.
2. Verify `provideRouter(routes)` is in `main.ts`.
3. Ensure Navbar router links point to correct paths.

**Relevant Context:**
- Angular 21 standalone lazy loading: `loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)`.
- No feature modules needed — each page component is itself the lazy boundary.

---

### Sub-Task 6 — Home Page

**Status:** [ ] pending

**Intent:**  
Build the Home page that users land on. It uses the shared components and presents the app's
value proposition.

**Expected Outcomes:**
- `src/app/features/home/home.component.ts` (standalone, lazy-loaded):
  - `<app-hero-banner>` at top with headline "Discover Your Next Great Read".
  - `<app-search-bar>` that navigates to `/books?q=...` on search.
  - "Featured Books" section: 6-book responsive grid using `<app-book-card>`.
  - Optional "Browse by Category" section: clickable category cards navigating to
    `/books?category=...`.
  - Layout is fully responsive.

**Todo List:**
1. Create `home.component.ts`, `home.component.html`, `home.component.scss`.
2. Inject `BookService` to get featured books Signal.
3. Wire `<app-search-bar>` to `Router.navigate(['/books'], { queryParams: { q } })`.
4. Wire `<app-book-card>` `addToCart` output to `CartService.addToCart`.
5. Wire category card clicks to `/books?category=...`.
6. Apply responsive grid CSS (1 → 2 → 3 → 4 columns across breakpoints).

**Relevant Context:**
- Featured books: `BookService.getFeatured()` returns first 6 items.
- Use CSS Grid with `grid-template-columns: repeat(auto-fill, minmax(..., 1fr))`.
- Category icons: use Material Icons names mapped to category strings.

---

### Sub-Task 7 — Books Page

**Status:** [ ] pending

**Intent:**  
Build the main catalogue page with search, filter, pagination UI, and the full book grid.

**Expected Outcomes:**
- `src/app/features/books/books.component.ts` (standalone, lazy-loaded):
  - Reads `?q` and `?category` query params and pre-populates filters.
  - `<app-search-bar>` bound to current search query.
  - `<app-category-filter>` bound to current category.
  - Responsive book grid (1/2/3/4 columns) of `<app-book-card>` components.
  - Pagination bar at bottom (UI only — `MatPaginator` wired to paginate the in-memory array).
  - Clicking a book card navigates to `/books/:id`.

**Todo List:**
1. Create `books.component.ts`, `books.component.html`, `books.component.scss`.
2. Read query params via `ActivatedRoute.queryParams`.
3. Use `computed` Signal for filtered/paginated book list.
4. Wire search and category filter events to update query params and filtered Signal.
5. Implement `MatPaginator` for in-memory pagination.
6. Navigate to `/books/:id` on book-card click.
7. Apply responsive grid CSS.

**Relevant Context:**
- `BookService.searchBooks(query, category)` handles filtering.
- `MatPaginatorModule` — page size 8 or 12.
- On mobile, `<app-category-filter>` chips should scroll horizontally.

---

### Sub-Task 8 — Book Details Page

**Status:** [ ] pending

**Intent:**  
Build the page that shows full book information and allows adding to cart.

**Expected Outcomes:**
- `src/app/features/book-details/book-details.component.ts` (standalone, lazy-loaded):
  - Reads `:id` from route params, loads book via `BookService.getBook(id)`.
  - Desktop: two-column layout — large cover image left, details right.
  - Mobile: image above details (stacked).
  - Shows: title, author, price, rating, pages, publisher, publishedDate, description.
  - "Add to Cart" button calls `CartService.addToCart(book)`.
  - "Related Books" section at bottom (4 books via `BookService.getRelated(id)`).

**Todo List:**
1. Create `book-details.component.ts`, `book-details.component.html`, `book-details.component.scss`.
2. Inject `ActivatedRoute` and `BookService` to load the book by ID.
3. Show a "not found" state if book ID doesn't exist.
4. Implement two-column (desktop) / stacked (mobile) layout with SCSS.
5. Wire "Add to Cart" to `CartService`.
6. Add "Related Books" row using `<app-book-card>`.

**Relevant Context:**
- Two-column layout: CSS Grid `grid-template-columns: 1fr 2fr` on laptop+; single column on mobile.
- Use `MatChipSet` for displaying category tag.
- Star rating: use `MatIcon` with `star` / `star_half` / `star_border` icons.

---

### Sub-Task 9 — Cart Page

**Status:** [ ] pending

**Intent:**  
Build the shopping cart page where users review, adjust, and proceed to checkout.

**Expected Outcomes:**
- `src/app/features/cart/cart.component.ts` (standalone, lazy-loaded):
  - Desktop: two-column layout — cart item list (left) + sticky order summary (right).
  - Mobile: single column, order summary below items.
  - Each cart item shows: cover, title, author, price per unit, quantity selector, remove button,
    line total.
  - Quantity selector uses `MatSelect` or `+/-` buttons that call `CartService.updateQuantity`.
  - Remove button calls `CartService.removeFromCart`.
  - Order summary: subtotal, shipping (flat $4.99 or free above $50), total.
  - "Checkout" button navigates to `/checkout`.
  - Empty cart state with illustration text and "Browse Books" link.

**Todo List:**
1. Create `cart.component.ts`, `cart.component.html`, `cart.component.scss`.
2. Inject `CartService` and use `cartItems` and `totalPrice` Signals.
3. Implement cart item row with quantity +/- controls and remove button.
4. Build order summary panel with computed shipping + total.
5. Implement empty cart state.
6. Apply two-column desktop / single-column mobile layout.

**Relevant Context:**
- `CartService.totalPrice` is a `computed` Signal.
- Shipping logic: `computed(() => totalPrice() >= 50 ? 0 : 4.99)`.
- Sticky summary: `position: sticky; top: 88px` on desktop.

---

### Sub-Task 9b — Checkout Page

**Status:** [ ] pending

**Intent:**
Build a minimal UI-only checkout confirmation page that users land on after clicking "Checkout"
from the cart. No form processing or payment integration — purely presentational.

**Expected Outcomes:**
- `src/app/features/checkout/checkout.component.ts` (standalone, lazy-loaded):
  - Shows an order summary read from `CartService` (items, quantities, total).
  - A simple "Place Order" button that clears the cart, shows a success message/snackbar,
    and redirects to `/` — simulating order completion.
  - Responsive single-column layout on mobile, centered card on desktop.
  - "Back to Cart" link.

**Todo List:**
1. Create `checkout.component.ts`, `checkout.component.html`, `checkout.component.scss`.
2. Read cart state from `CartService.cartItems` and `totalPrice` Signals.
3. Implement "Place Order" button: call `CartService.clearCart()`, show `MatSnackBar` success,
   navigate to `/`.
4. Add `clearCart()` method to `CartService` if not already present.
5. Add "Back to Cart" `routerLink` to `/cart`.
6. Apply responsive layout.

**Relevant Context:**
- Use `MatSnackBar` for the order-placed toast notification.
- `CartService.clearCart()` sets `cartItems` Signal to `[]`.
- Desktop: centered `MatCard` max-width 800px; mobile: full-width.

---

### Sub-Task 10 — Responsive Refinements & Final Cleanup

**Status:** [ ] pending

**Intent:**  
Do a cross-cutting pass to ensure all breakpoints work correctly, typography is consistent,
animations are present, accessibility is covered, and the code is clean.

**Expected Outcomes:**
- All four pages are visually verified at 375px, 768px, 1280px, and 1440px viewports.
- Material theme color palette is consistent throughout (primary, accent, warn).
- Smooth CSS transitions on hover states for cards, buttons, and links.
- ARIA labels on interactive elements (search input, cart badge, hamburger button).
- `@if` / `@for` (Angular 17+ control flow) used instead of `*ngIf` / `*ngFor`.
- No `console.error` or TypeScript compile warnings.
- `styles.scss` is DRY — no duplicated breakpoint media queries.
- All images have `alt` attributes.
- `ng build --configuration production` completes with no errors.

**Todo List:**
1. Audit all component SCSS for missing mobile-first breakpoints.
2. Add `transition: all 0.2s ease` on `.book-card` hover and button focus states.
3. Add ARIA labels: `aria-label` on icon-only buttons and inputs.
4. Replace any remaining `*ngIf` / `*ngFor` with `@if` / `@for`.
5. Verify cart badge updates reactively across all breakpoints.
6. Check color contrast ratios for primary text and muted text.
7. Run `ng build` to confirm zero errors and zero new warnings.

**Relevant Context:**
- Angular 17+ template syntax: `@for (item of items; track item.id)`, `@if (condition)`.
- Material Design elevation: use `mat-elevation-z2` on cards.
- Ensure `provideAnimationsAsync()` (or `provideAnimations()`) is included in `main.ts`.

---

## Architecture Diagram

```
AppComponent (shell)
├── NavbarComponent (core/layout)
├── RouterOutlet
│   ├── HomeComponent          (lazy)  uses: HeroBannerComponent, SearchBarComponent, BookCardComponent, CategoryFilterComponent
│   ├── BooksComponent         (lazy)  uses: SearchBarComponent, CategoryFilterComponent, BookCardComponent
│   ├── BookDetailsComponent   (lazy)  uses: BookCardComponent (related)
│   ├── CartComponent          (lazy)  navigates to /checkout
│   └── CheckoutComponent      (lazy)  reads CartService, clears cart on "Place Order"
└── FooterComponent (core/layout)

Services (root):
  BookService  → books Signal (24 mock books)
  CartService  → cartItems Signal, totalPrice computed Signal
```

---

## File Tree (target state)

```
src/
├── index.html
├── main.ts
├── styles.scss
└── app/
    ├── app.ts
    ├── app.routes.ts
    ├── core/
    │   └── layout/
    │       ├── navbar/
    │       │   ├── navbar.component.ts
    │       │   ├── navbar.component.html
    │       │   └── navbar.component.scss
    │       └── footer/
    │           ├── footer.component.ts
    │           ├── footer.component.html
    │           └── footer.component.scss
    ├── features/
    │   ├── home/
    │   │   ├── home.component.ts
    │   │   ├── home.component.html
    │   │   └── home.component.scss
    │   ├── books/
    │   │   ├── books.component.ts
    │   │   ├── books.component.html
    │   │   └── books.component.scss
    │   ├── book-details/
    │   │   ├── book-details.component.ts
    │   │   ├── book-details.component.html
    │   │   └── book-details.component.scss
    │   ├── cart/
    │   │   ├── cart.component.ts
    │   │   ├── cart.component.html
    │   │   └── cart.component.scss
    │   └── checkout/
    │       ├── checkout.component.ts
    │       ├── checkout.component.html
    │       └── checkout.component.scss
    └── shared/
        ├── models/
        │   ├── book.model.ts
        │   └── cart-item.model.ts
        ├── services/
        │   ├── book.service.ts
        │   └── cart.service.ts
        └── components/
            ├── book-card/
            │   ├── book-card.component.ts
            │   ├── book-card.component.html
            │   └── book-card.component.scss
            ├── hero-banner/
            │   ├── hero-banner.component.ts
            │   ├── hero-banner.component.html
            │   └── hero-banner.component.scss
            ├── search-bar/
            │   ├── search-bar.component.ts
            │   ├── search-bar.component.html
            │   └── search-bar.component.scss
            └── category-filter/
                ├── category-filter.component.ts
                ├── category-filter.component.html
                └── category-filter.component.scss
```

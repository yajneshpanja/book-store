import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookService } from '../../shared/services/book.service';
import { CartService } from '../../shared/services/cart.service';
import { AuthGuardService } from '../../shared/services/auth-guard.service';
import { Book, Category } from '../../shared/models/book.model';
import { HeroBannerComponent } from '../../shared/components/hero-banner/hero-banner.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { BookCardComponent } from '../../shared/components/book-card/book-card.component';

interface CategoryCard {
  label: Category;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    HeroBannerComponent,
    SearchBarComponent,
    BookCardComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private router         = inject(Router);
  private bookService    = inject(BookService);
  private cartService    = inject(CartService);
  private authGuard      = inject(AuthGuardService);

  /** Featured books — loaded from API on init */
  readonly featuredBooks = signal<Book[]>([]);
  readonly loadingFeatured = signal(false);

  readonly categoryCards: CategoryCard[] = [
    { label: 'Fiction',     icon: 'auto_stories',  color: '#6366f1' },
    { label: 'Non-Fiction', icon: 'lightbulb',     color: '#f59e0b' },
    { label: 'Science',     icon: 'science',       color: '#10b981' },
    { label: 'Technology',  icon: 'computer',      color: '#3b82f6' },
    { label: 'Fantasy',     icon: 'auto_fix_high', color: '#8b5cf6' },
    { label: 'Biography',   icon: 'person',        color: '#ec4899' },
  ];

  async ngOnInit(): Promise<void> {
    this.loadingFeatured.set(true);
    try {
      const books = await this.bookService.getFeatured();
      this.featuredBooks.set(books);
    } catch {
      // Featured section silently hides on error
    } finally {
      this.loadingFeatured.set(false);
    }
  }

  onSearch(query: string): void {
    if (query.trim()) {
      this.router.navigate(['/books'], { queryParams: { q: query } });
    }
  }

  onAddToCart(book: Book): void {
    if (!this.authGuard.requireLogin()) return;
    this.cartService.addToCart(book);
  }

  navigateToCategory(category: Category): void {
    this.router.navigate(['/books'], { queryParams: { category } });
  }
}

import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { BookService } from '../../shared/services/book.service';
import { CartService } from '../../shared/services/cart.service';
import { Book, Category } from '../../shared/models/book.model';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { CategoryFilterComponent } from '../../shared/components/category-filter/category-filter.component';
import { BookCardComponent } from '../../shared/components/book-card/book-card.component';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [
    MatPaginatorModule,
    SearchBarComponent,
    CategoryFilterComponent,
    BookCardComponent,
  ],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss',
})
export class BooksComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  private cartService = inject(CartService);

  readonly categories = this.bookService.categories;

  // Filter state
  readonly searchQuery = signal('');
  readonly selectedCategory = signal<Category | ''>('');

  // Pagination
  readonly pageIndex = signal(0);
  readonly pageSize = signal(PAGE_SIZE);

  /** All books matching current filters */
  readonly filteredBooks = computed(() =>
    this.bookService.searchBooks(this.searchQuery(), this.selectedCategory())
  );

  /** Current page slice */
  readonly pagedBooks = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredBooks().slice(start, start + this.pageSize());
  });

  private querySub!: Subscription;

  ngOnInit(): void {
    this.querySub = this.route.queryParams.subscribe((params) => {
      this.searchQuery.set(params['q'] ?? '');
      this.selectedCategory.set((params['category'] as Category) ?? '');
      this.pageIndex.set(0);
    });
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  onSearch(query: string): void {
    this.router.navigate([], {
      queryParams: { q: query || null, category: this.selectedCategory() || null },
      queryParamsHandling: 'merge',
    });
  }

  onCategoryChange(cat: Category | ''): void {
    this.router.navigate([], {
      queryParams: { category: cat || null, q: this.searchQuery() || null },
      queryParamsHandling: 'merge',
    });
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onAddToCart(book: Book): void {
    this.cartService.addToCart(book);
  }
}

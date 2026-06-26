import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BookService } from '../../shared/services/book.service';
import { CartService } from '../../shared/services/cart.service';
import { Book } from '../../shared/models/book.model';
import { BookCardComponent } from '../../shared/components/book-card/book-card.component';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [
    RouterLink,
    SlicePipe,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    BookCardComponent,
  ],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.scss',
})
export class BookDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);

  readonly book = signal<Book | undefined>(undefined);
  readonly relatedBooks = computed<Book[]>(() =>
    this.book() ? this.bookService.getRelated(this.book()!.id) : []
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.book.set(this.bookService.getBook(id));
  }

  get starIcons(): string[] {
    const b = this.book();
    if (!b) return [];
    const icons: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (b.rating >= i)           icons.push('star');
      else if (b.rating >= i - 0.5) icons.push('star_half');
      else                          icons.push('star_border');
    }
    return icons;
  }

  addToCart(): void {
    const b = this.book();
    if (!b) return;
    this.cartService.addToCart(b);
    this.snackBar.open(`"${b.title}" added to cart`, 'View Cart', {
      duration: 3000,
      panelClass: 'snack-success',
    }).onAction().subscribe(() => this.router.navigate(['/cart']));
  }

  onRelatedAddToCart(book: Book): void {
    this.cartService.addToCart(book);
    this.snackBar.open(`"${book.title}" added to cart`, 'Dismiss', { duration: 2500 });
  }
}

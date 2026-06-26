import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.scss',
})
export class BookCardComponent {
  @Input({ required: true }) book!: Book;
  @Output() addToCart = new EventEmitter<Book>();

  /** Produces an array of icon names for 5 star positions */
  get starIcons(): string[] {
    const icons: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (this.book.rating >= i) {
        icons.push('star');
      } else if (this.book.rating >= i - 0.5) {
        icons.push('star_half');
      } else {
        icons.push('star_border');
      }
    }
    return icons;
  }

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(this.book);
  }
}

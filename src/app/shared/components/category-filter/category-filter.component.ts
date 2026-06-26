import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Category } from '../../models/book.model';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [MatChipsModule, MatIconModule],
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.scss',
})
export class CategoryFilterComponent {
  @Input() categories: Category[] = [
    'Fiction',
    'Non-Fiction',
    'Science',
    'History',
    'Technology',
    'Biography',
    'Fantasy',
    'Mystery',
  ];

  @Input() selected: Category | '' = '';

  @Output() categoryChange = new EventEmitter<Category | ''>();

  /** Map of category → Material Icon name */
  readonly categoryIcons: Record<string, string> = {
    'Fiction':     'auto_stories',
    'Non-Fiction': 'lightbulb',
    'Science':     'science',
    'History':     'history_edu',
    'Technology':  'computer',
    'Biography':   'person',
    'Fantasy':     'auto_fix_high',
    'Mystery':     'search',
  };

  select(cat: Category | ''): void {
    // Toggle off if already selected
    const next = this.selected === cat ? '' : cat;
    this.categoryChange.emit(next as Category | '');
  }
}

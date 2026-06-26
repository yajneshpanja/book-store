import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements OnInit, OnDestroy {
  /** Pre-populate the search field from the parent */
  @Input() set initialValue(val: string) {
    if (val !== this.searchControl.value) {
      this.searchControl.setValue(val, { emitEvent: false });
    }
  }

  @Input() placeholder = 'Search by title or author…';

  /** Emits 300 ms after the user stops typing */
  @Output() search = new EventEmitter<string>();

  readonly searchControl = new FormControl('');
  private sub!: Subscription;

  ngOnInit(): void {
    this.sub = this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((val) => this.search.emit(val ?? ''));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onSearchClick(): void {
    this.search.emit(this.searchControl.value ?? '');
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.search.emit('');
  }
}

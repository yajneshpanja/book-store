import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly year = new Date().getFullYear();

  readonly categories = [
    { label: 'Fiction',     value: 'Fiction' },
    { label: 'Non-Fiction', value: 'Non-Fiction' },
    { label: 'Science',     value: 'Science' },
    { label: 'Technology',  value: 'Technology' },
    { label: 'Fantasy',     value: 'Fantasy' },
    { label: 'Biography',   value: 'Biography' },
  ];
}

import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.scss',
})
export class HeroBannerComponent {
  @Input() title = 'Discover Your Next Great Read';
  @Input() subtitle = 'Explore thousands of books across every genre.';
  @Input() ctaText = 'Browse Books';
  @Input() ctaLink = '/books';
}

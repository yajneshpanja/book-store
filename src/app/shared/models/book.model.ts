export type Category =
  | 'Fiction'
  | 'Non-Fiction'
  | 'Science'
  | 'History'
  | 'Technology'
  | 'Biography'
  | 'Fantasy'
  | 'Mystery';

export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  coverImage: string;
  category: Category;
  description: string;
  rating: number;      // 1–5, supports .5 increments
  pages: number;
  publisher: string;
  publishedDate: string; // ISO date string
  featured: boolean;
}

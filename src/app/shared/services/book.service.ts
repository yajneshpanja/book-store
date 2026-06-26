import { Injectable, signal, computed } from '@angular/core';
import { Book, Category } from '../models/book.model';

const MOCK_BOOKS: Book[] = [
  // Fiction (6)
  {
    id: 1,
    title: 'The Midnight Library',
    author: 'Matt Haig',
    price: 14.99,
    coverImage: 'https://picsum.photos/seed/book1/300/400',
    category: 'Fiction',
    description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
    rating: 4.5,
    pages: 304,
    publisher: 'Canongate Books',
    publishedDate: '2020-09-29',
    featured: true,
  },
  {
    id: 2,
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    price: 16.99,
    coverImage: 'https://picsum.photos/seed/book2/300/400',
    category: 'Fiction',
    description: 'A lone astronaut must save the earth from disaster in this gripping adventure from the author of The Martian.',
    rating: 5,
    pages: 476,
    publisher: 'Ballantine Books',
    publishedDate: '2021-05-04',
    featured: true,
  },
  {
    id: 3,
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    price: 13.99,
    coverImage: 'https://picsum.photos/seed/book3/300/400',
    category: 'Fiction',
    description: 'A novel that asks: what does it mean to love? Told from the perspective of an Artificial Friend named Klara.',
    rating: 4,
    pages: 320,
    publisher: 'Faber & Faber',
    publishedDate: '2021-03-02',
    featured: true,
  },
  {
    id: 4,
    title: 'The Vanishing Half',
    author: 'Brit Bennett',
    price: 12.99,
    coverImage: 'https://picsum.photos/seed/book4/300/400',
    category: 'Fiction',
    description: 'The Vignes twin sisters will always be identical. But after growing up together in a small, southern Black community, the two fall into two completely different lives.',
    rating: 4.5,
    pages: 343,
    publisher: 'Riverhead Books',
    publishedDate: '2020-06-02',
    featured: false,
  },
  {
    id: 5,
    title: 'Normal People',
    author: 'Sally Rooney',
    price: 11.99,
    coverImage: 'https://picsum.photos/seed/book5/300/400',
    category: 'Fiction',
    description: 'A story about the complicated intimacy that can develop between two people who, on the surface, seem to have very little in common.',
    rating: 4,
    pages: 273,
    publisher: 'Faber & Faber',
    publishedDate: '2018-08-30',
    featured: false,
  },
  {
    id: 6,
    title: 'The Thursday Murder Club',
    author: 'Richard Osman',
    price: 13.49,
    coverImage: 'https://picsum.photos/seed/book6/300/400',
    category: 'Mystery',
    description: 'Four unlikely friends meet weekly in a retirement village to investigate cold cases. But when a real murder occurs on their doorstep, the Thursday Murder Club is in action.',
    rating: 4.5,
    pages: 382,
    publisher: 'Viking',
    publishedDate: '2020-09-03',
    featured: true,
  },
  // Non-Fiction (4)
  {
    id: 7,
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    price: 15.99,
    coverImage: 'https://picsum.photos/seed/book7/300/400',
    category: 'Non-Fiction',
    description: 'A landmark book on the science of decision-making, exploring the two systems of thought that drive how we think and make choices.',
    rating: 4.5,
    pages: 499,
    publisher: 'Farrar, Straus and Giroux',
    publishedDate: '2011-10-25',
    featured: true,
  },
  {
    id: 8,
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    price: 16.49,
    coverImage: 'https://picsum.photos/seed/book8/300/400',
    category: 'History',
    description: 'A brief history of humankind from the Stone Age to the twenty-first century, exploring how Homo sapiens came to dominate the world.',
    rating: 5,
    pages: 443,
    publisher: 'Harper',
    publishedDate: '2015-02-10',
    featured: true,
  },
  {
    id: 9,
    title: 'Educated',
    author: 'Tara Westover',
    price: 14.49,
    coverImage: 'https://picsum.photos/seed/book9/300/400',
    category: 'Biography',
    description: 'A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.',
    rating: 5,
    pages: 352,
    publisher: 'Random House',
    publishedDate: '2018-02-20',
    featured: false,
  },
  {
    id: 10,
    title: 'Atomic Habits',
    author: 'James Clear',
    price: 17.99,
    coverImage: 'https://picsum.photos/seed/book10/300/400',
    category: 'Non-Fiction',
    description: 'A practical guide to building good habits and breaking bad ones, grounded in psychology and neuroscience.',
    rating: 5,
    pages: 320,
    publisher: 'Avery',
    publishedDate: '2018-10-16',
    featured: false,
  },
  // Technology (4)
  {
    id: 11,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    price: 35.99,
    coverImage: 'https://picsum.photos/seed/book11/300/400',
    category: 'Technology',
    description: 'A handbook of agile software craftsmanship — how to write readable, maintainable, and elegant code.',
    rating: 4.5,
    pages: 431,
    publisher: 'Prentice Hall',
    publishedDate: '2008-08-01',
    featured: false,
  },
  {
    id: 12,
    title: 'The Pragmatic Programmer',
    author: 'David Thomas, Andrew Hunt',
    price: 42.99,
    coverImage: 'https://picsum.photos/seed/book12/300/400',
    category: 'Technology',
    description: 'Your journey to mastery — timeless lessons on software craftsmanship for developers at any career stage.',
    rating: 4.5,
    pages: 352,
    publisher: 'Addison-Wesley',
    publishedDate: '2019-09-23',
    featured: false,
  },
  {
    id: 13,
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    price: 49.99,
    coverImage: 'https://picsum.photos/seed/book13/300/400',
    category: 'Technology',
    description: 'The big ideas behind reliable, scalable, and maintainable systems — a deep-dive into the internals of databases and distributed systems.',
    rating: 5,
    pages: 616,
    publisher: "O'Reilly Media",
    publishedDate: '2017-04-18',
    featured: false,
  },
  {
    id: 14,
    title: 'You Don\'t Know JS',
    author: 'Kyle Simpson',
    price: 29.99,
    coverImage: 'https://picsum.photos/seed/book14/300/400',
    category: 'Technology',
    description: 'A series of books diving deep into the core mechanisms of the JavaScript language.',
    rating: 4.5,
    pages: 278,
    publisher: "O'Reilly Media",
    publishedDate: '2014-12-27',
    featured: false,
  },
  // Science (4)
  {
    id: 15,
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    price: 12.99,
    coverImage: 'https://picsum.photos/seed/book15/300/400',
    category: 'Science',
    description: 'An exploration of cosmology, from the Big Bang to black holes, written for general audiences.',
    rating: 4.5,
    pages: 212,
    publisher: 'Bantam Books',
    publishedDate: '1988-04-01',
    featured: false,
  },
  {
    id: 16,
    title: 'The Gene',
    author: 'Siddhartha Mukherjee',
    price: 17.99,
    coverImage: 'https://picsum.photos/seed/book16/300/400',
    category: 'Science',
    description: 'An intimate history of genetics, from Gregor Mendel to CRISPR, exploring how we came to understand the building blocks of life.',
    rating: 4,
    pages: 608,
    publisher: 'Scribner',
    publishedDate: '2016-05-17',
    featured: false,
  },
  {
    id: 17,
    title: 'The Body',
    author: 'Bill Bryson',
    price: 15.49,
    coverImage: 'https://picsum.photos/seed/book17/300/400',
    category: 'Science',
    description: 'A tour through the human body — its parts, their quirks, and the incredible science that keeps us alive.',
    rating: 4.5,
    pages: 464,
    publisher: 'Doubleday',
    publishedDate: '2019-10-15',
    featured: false,
  },
  {
    id: 18,
    title: 'Seven Brief Lessons on Physics',
    author: 'Carlo Rovelli',
    price: 10.99,
    coverImage: 'https://picsum.photos/seed/book18/300/400',
    category: 'Science',
    description: 'Seven short, crystal-clear lessons on the key ideas in modern physics — from general relativity to quantum mechanics.',
    rating: 4.5,
    pages: 96,
    publisher: 'Riverhead Books',
    publishedDate: '2016-03-01',
    featured: false,
  },
  // Fantasy (4)
  {
    id: 19,
    title: 'The Name of the Wind',
    author: 'Patrick Rothfuss',
    price: 14.99,
    coverImage: 'https://picsum.photos/seed/book19/300/400',
    category: 'Fantasy',
    description: 'The tale of the legendary figure Kvothe — the best book you will read, according to its narrator.',
    rating: 5,
    pages: 662,
    publisher: 'DAW Books',
    publishedDate: '2007-03-27',
    featured: false,
  },
  {
    id: 20,
    title: 'The Way of Kings',
    author: 'Brandon Sanderson',
    price: 18.99,
    coverImage: 'https://picsum.photos/seed/book20/300/400',
    category: 'Fantasy',
    description: 'The first book in the Stormlight Archive — an epic fantasy set on a world battered by storms, following soldiers, scholars, and assassins.',
    rating: 5,
    pages: 1007,
    publisher: 'Tor Books',
    publishedDate: '2010-08-31',
    featured: false,
  },
  {
    id: 21,
    title: 'American Gods',
    author: 'Neil Gaiman',
    price: 13.99,
    coverImage: 'https://picsum.photos/seed/book21/300/400',
    category: 'Fantasy',
    description: 'A gripping exploration of faith and belief, set against the backdrop of a war between old and new gods in modern America.',
    rating: 4.5,
    pages: 465,
    publisher: 'William Morrow',
    publishedDate: '2001-06-19',
    featured: false,
  },
  {
    id: 22,
    title: 'The Lies of Locke Lamora',
    author: 'Scott Lynch',
    price: 14.49,
    coverImage: 'https://picsum.photos/seed/book22/300/400',
    category: 'Fantasy',
    description: 'A master thief and his crew of con artists take on the criminal underworld of a fantastical city — with disastrous results.',
    rating: 4.5,
    pages: 499,
    publisher: 'Bantam Spectra',
    publishedDate: '2006-06-27',
    featured: false,
  },
  // Biography (2)
  {
    id: 23,
    title: 'Leonardo da Vinci',
    author: 'Walter Isaacson',
    price: 19.99,
    coverImage: 'https://picsum.photos/seed/book23/300/400',
    category: 'Biography',
    description: 'Based on thousands of pages of his notebooks, a biography of history\'s most creative genius, revealing the link between art and science.',
    rating: 4.5,
    pages: 624,
    publisher: 'Simon & Schuster',
    publishedDate: '2017-10-17',
    featured: false,
  },
  {
    id: 24,
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    price: 17.99,
    coverImage: 'https://picsum.photos/seed/book24/300/400',
    category: 'Biography',
    description: 'The exclusive biography of Steve Jobs — based on more than 40 interviews with Jobs conducted over two years, as well as interviews with more than 100 family members, friends, adversaries, competitors, and colleagues.',
    rating: 4,
    pages: 656,
    publisher: 'Simon & Schuster',
    publishedDate: '2011-10-24',
    featured: false,
  },
];

@Injectable({ providedIn: 'root' })
export class BookService {
  /** All 24 books as a readonly Signal */
  readonly books = signal<Book[]>(MOCK_BOOKS);

  /** All unique categories derived from the book list */
  readonly categories = computed<Category[]>(() => {
    const cats = this.books().map((b) => b.category);
    return [...new Set(cats)] as Category[];
  });

  /** First 6 featured books for the Home page */
  getFeatured(): Book[] {
    return this.books()
      .filter((b) => b.featured)
      .slice(0, 6);
  }

  /** Single book lookup by ID */
  getBook(id: number): Book | undefined {
    return this.books().find((b) => b.id === id);
  }

  /**
   * Returns up to 4 books in the same category, excluding the source book.
   */
  getRelated(bookId: number): Book[] {
    const book = this.getBook(bookId);
    if (!book) return [];
    return this.books()
      .filter((b) => b.category === book.category && b.id !== bookId)
      .slice(0, 4);
  }

  /**
   * Filtered search: both query and category are optional.
   * Matching is case-insensitive and searches title + author.
   */
  searchBooks(query: string, category: Category | '' = ''): Book[] {
    const q = query.trim().toLowerCase();
    return this.books().filter((b) => {
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q);
      const matchesCategory = !category || b.category === category;
      return matchesQuery && matchesCategory;
    });
  }
}

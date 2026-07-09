-- =============================================================================
-- Bookstore Database Schema
-- MySQL 8.0+
-- =============================================================================

-- Drop and recreate for clean setup
DROP DATABASE IF EXISTS bookstore_db;
CREATE DATABASE bookstore_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bookstore_db;

-- =============================================================================
-- TABLE: books
-- Matches Angular Book interface exactly (camelCase mapped in app layer)
-- =============================================================================
CREATE TABLE books (
  id             INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  title          VARCHAR(255)     NOT NULL,
  author         VARCHAR(255)     NOT NULL,
  price          DECIMAL(8,2)     NOT NULL CHECK (price >= 0),
  cover_image    VARCHAR(500)     NOT NULL,
  category       ENUM(
                   'Fiction',
                   'Non-Fiction',
                   'Science',
                   'History',
                   'Technology',
                   'Biography',
                   'Fantasy',
                   'Mystery'
                 )                NOT NULL,
  description    TEXT             NOT NULL,
  rating         DECIMAL(3,1)     NOT NULL CHECK (rating BETWEEN 1.0 AND 5.0),
  pages          SMALLINT UNSIGNED NOT NULL,
  publisher      VARCHAR(255)     NOT NULL,
  published_date DATE             NOT NULL,
  featured       TINYINT(1)       NOT NULL DEFAULT 0,
  created_at     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                           ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_category (category),
  INDEX idx_featured (featured),
  FULLTEXT INDEX ft_search (title, author)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: users
-- Stores registered user accounts.
-- Passwords are stored as bcrypt hashes (never plain-text).
-- Must be created BEFORE carts (carts.user_id references users.id).
-- =============================================================================
CREATE TABLE users (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name          VARCHAR(255)  NOT NULL,
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE INDEX uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: carts
-- Each authenticated user gets one persistent cart keyed by "user:<id>".
-- =============================================================================
CREATE TABLE carts (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  session_id  VARCHAR(40)   NOT NULL,           -- UUID v4 (guest) OR "user:<id>"
  user_id     INT UNSIGNED      NULL DEFAULT NULL,  -- set for logged-in users
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE INDEX uq_session_id (session_id),       -- one cart per session key
  UNIQUE INDEX uq_user_id    (user_id),           -- one cart per user

  CONSTRAINT fk_carts_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: cart_items
-- One row per (cart, book) pair. Quantity updated in place.
-- =============================================================================
CREATE TABLE cart_items (
  id         INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  cart_id    INT UNSIGNED      NOT NULL,
  book_id    INT UNSIGNED      NOT NULL,
  quantity   SMALLINT UNSIGNED NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  added_at   TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE INDEX uq_cart_book (cart_id, book_id),  -- one row per book per cart
  INDEX idx_cart_id (cart_id),
  INDEX idx_book_id (book_id),

  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id) REFERENCES carts(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_cart_items_book
    FOREIGN KEY (book_id) REFERENCES books(id)
    ON DELETE CASCADE                             -- remove line if book is deleted
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: orders
-- =============================================================================
CREATE TABLE orders (
  id             INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  customer_name  VARCHAR(255)         NULL,
  customer_email VARCHAR(255)         NULL,
  subtotal       DECIMAL(10,2)    NOT NULL CHECK (subtotal >= 0),
  shipping       DECIMAL(6,2)     NOT NULL DEFAULT 0.00 CHECK (shipping >= 0),
  total          DECIMAL(10,2)    NOT NULL CHECK (total >= 0),
  status         ENUM(
                   'confirmed',
                   'cancelled'
                 )                NOT NULL DEFAULT 'confirmed',
  created_at     TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- TABLE: order_items
-- Stores price snapshot at time of purchase (prevents drift if book price changes)
-- =============================================================================
CREATE TABLE order_items (
  id          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  order_id    INT UNSIGNED     NOT NULL,
  book_id     INT UNSIGNED     NOT NULL,
  quantity    SMALLINT UNSIGNED NOT NULL CHECK (quantity >= 1),
  unit_price  DECIMAL(8,2)     NOT NULL CHECK (unit_price >= 0),

  PRIMARY KEY (id),
  INDEX idx_order_id (order_id),
  INDEX idx_book_id  (book_id),

  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_order_items_book
    FOREIGN KEY (book_id)  REFERENCES books(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- SEED DATA: 24 books (mirrors Angular MOCK_BOOKS exactly)
-- =============================================================================
INSERT INTO books
  (id, title, author, price, cover_image, category, description, rating, pages, publisher, published_date, featured)
VALUES

-- ── Fiction (6) ──────────────────────────────────────────────────────────────
(1,
 'The Midnight Library',
 'Matt Haig',
 14.99,
 'https://picsum.photos/seed/book1/300/400',
 'Fiction',
 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
 4.5, 304, 'Canongate Books', '2020-09-29', 1),

(2,
 'Project Hail Mary',
 'Andy Weir',
 16.99,
 'https://picsum.photos/seed/book2/300/400',
 'Fiction',
 'A lone astronaut must save the earth from disaster in this gripping adventure from the author of The Martian.',
 5.0, 476, 'Ballantine Books', '2021-05-04', 1),

(3,
 'Klara and the Sun',
 'Kazuo Ishiguro',
 13.99,
 'https://picsum.photos/seed/book3/300/400',
 'Fiction',
 'A novel that asks: what does it mean to love? Told from the perspective of an Artificial Friend named Klara.',
 4.0, 320, 'Faber & Faber', '2021-03-02', 1),

(4,
 'The Vanishing Half',
 'Brit Bennett',
 12.99,
 'https://picsum.photos/seed/book4/300/400',
 'Fiction',
 'The Vignes twin sisters will always be identical. But after growing up together in a small, southern Black community, the two fall into two completely different lives.',
 4.5, 343, 'Riverhead Books', '2020-06-02', 0),

(5,
 'Normal People',
 'Sally Rooney',
 11.99,
 'https://picsum.photos/seed/book5/300/400',
 'Fiction',
 'A story about the complicated intimacy that can develop between two people who, on the surface, seem to have very little in common.',
 4.0, 273, 'Faber & Faber', '2018-08-30', 0),

(6,
 'The Thursday Murder Club',
 'Richard Osman',
 13.49,
 'https://picsum.photos/seed/book6/300/400',
 'Mystery',
 'Four unlikely friends meet weekly in a retirement village to investigate cold cases. But when a real murder occurs on their doorstep, the Thursday Murder Club is in action.',
 4.5, 382, 'Viking', '2020-09-03', 1),

-- ── Non-Fiction (2) ──────────────────────────────────────────────────────────
(7,
 'Thinking, Fast and Slow',
 'Daniel Kahneman',
 15.99,
 'https://picsum.photos/seed/book7/300/400',
 'Non-Fiction',
 'A landmark book on the science of decision-making, exploring the two systems of thought that drive how we think and make choices.',
 4.5, 499, 'Farrar, Straus and Giroux', '2011-10-25', 1),

(10,
 'Atomic Habits',
 'James Clear',
 17.99,
 'https://picsum.photos/seed/book10/300/400',
 'Non-Fiction',
 'A practical guide to building good habits and breaking bad ones, grounded in psychology and neuroscience.',
 5.0, 320, 'Avery', '2018-10-16', 0),

-- ── History (1) ──────────────────────────────────────────────────────────────
(8,
 'Sapiens',
 'Yuval Noah Harari',
 16.49,
 'https://picsum.photos/seed/book8/300/400',
 'History',
 'A brief history of humankind from the Stone Age to the twenty-first century, exploring how Homo sapiens came to dominate the world.',
 5.0, 443, 'Harper', '2015-02-10', 1),

-- ── Biography (3) ────────────────────────────────────────────────────────────
(9,
 'Educated',
 'Tara Westover',
 14.49,
 'https://picsum.photos/seed/book9/300/400',
 'Biography',
 'A memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.',
 5.0, 352, 'Random House', '2018-02-20', 0),

(23,
 'Leonardo da Vinci',
 'Walter Isaacson',
 19.99,
 'https://picsum.photos/seed/book23/300/400',
 'Biography',
 'Based on thousands of pages of his notebooks, a biography of history''s most creative genius, revealing the link between art and science.',
 4.5, 624, 'Simon & Schuster', '2017-10-17', 0),

(24,
 'Steve Jobs',
 'Walter Isaacson',
 17.99,
 'https://picsum.photos/seed/book24/300/400',
 'Biography',
 'The exclusive biography of Steve Jobs — based on more than 40 interviews with Jobs conducted over two years, as well as interviews with more than 100 family members, friends, adversaries, competitors, and colleagues.',
 4.0, 656, 'Simon & Schuster', '2011-10-24', 0),

-- ── Technology (4) ───────────────────────────────────────────────────────────
(11,
 'Clean Code',
 'Robert C. Martin',
 35.99,
 'https://picsum.photos/seed/book11/300/400',
 'Technology',
 'A handbook of agile software craftsmanship — how to write readable, maintainable, and elegant code.',
 4.5, 431, 'Prentice Hall', '2008-08-01', 0),

(12,
 'The Pragmatic Programmer',
 'David Thomas, Andrew Hunt',
 42.99,
 'https://picsum.photos/seed/book12/300/400',
 'Technology',
 'Your journey to mastery — timeless lessons on software craftsmanship for developers at any career stage.',
 4.5, 352, 'Addison-Wesley', '2019-09-23', 0),

(13,
 'Designing Data-Intensive Applications',
 'Martin Kleppmann',
 49.99,
 'https://picsum.photos/seed/book13/300/400',
 'Technology',
 'The big ideas behind reliable, scalable, and maintainable systems — a deep-dive into the internals of databases and distributed systems.',
 5.0, 616, 'O''Reilly Media', '2017-04-18', 0),

(14,
 'You Don''t Know JS',
 'Kyle Simpson',
 29.99,
 'https://picsum.photos/seed/book14/300/400',
 'Technology',
 'A series of books diving deep into the core mechanisms of the JavaScript language.',
 4.5, 278, 'O''Reilly Media', '2014-12-27', 0),

-- ── Science (4) ──────────────────────────────────────────────────────────────
(15,
 'A Brief History of Time',
 'Stephen Hawking',
 12.99,
 'https://picsum.photos/seed/book15/300/400',
 'Science',
 'An exploration of cosmology, from the Big Bang to black holes, written for general audiences.',
 4.5, 212, 'Bantam Books', '1988-04-01', 0),

(16,
 'The Gene',
 'Siddhartha Mukherjee',
 17.99,
 'https://picsum.photos/seed/book16/300/400',
 'Science',
 'An intimate history of genetics, from Gregor Mendel to CRISPR, exploring how we came to understand the building blocks of life.',
 4.0, 608, 'Scribner', '2016-05-17', 0),

(17,
 'The Body',
 'Bill Bryson',
 15.49,
 'https://picsum.photos/seed/book17/300/400',
 'Science',
 'A tour through the human body — its parts, their quirks, and the incredible science that keeps us alive.',
 4.5, 464, 'Doubleday', '2019-10-15', 0),

(18,
 'Seven Brief Lessons on Physics',
 'Carlo Rovelli',
 10.99,
 'https://picsum.photos/seed/book18/300/400',
 'Science',
 'Seven short, crystal-clear lessons on the key ideas in modern physics — from general relativity to quantum mechanics.',
 4.5, 96, 'Riverhead Books', '2016-03-01', 0),

-- ── Fantasy (4) ──────────────────────────────────────────────────────────────
(19,
 'The Name of the Wind',
 'Patrick Rothfuss',
 14.99,
 'https://picsum.photos/seed/book19/300/400',
 'Fantasy',
 'The tale of the legendary figure Kvothe — the best book you will read, according to its narrator.',
 5.0, 662, 'DAW Books', '2007-03-27', 0),

(20,
 'The Way of Kings',
 'Brandon Sanderson',
 18.99,
 'https://picsum.photos/seed/book20/300/400',
 'Fantasy',
 'The first book in the Stormlight Archive — an epic fantasy set on a world battered by storms, following soldiers, scholars, and assassins.',
 5.0, 1007, 'Tor Books', '2010-08-31', 0),

(21,
 'American Gods',
 'Neil Gaiman',
 13.99,
 'https://picsum.photos/seed/book21/300/400',
 'Fantasy',
 'A gripping exploration of faith and belief, set against the backdrop of a war between old and new gods in modern America.',
 4.5, 465, 'William Morrow', '2001-06-19', 0),

(22,
 'The Lies of Locke Lamora',
 'Scott Lynch',
 14.49,
 'https://picsum.photos/seed/book22/300/400',
 'Fantasy',
 'A master thief and his crew of con artists take on the criminal underworld of a fantastical city — with disastrous results.',
 4.5, 499, 'Bantam Spectra', '2006-06-27', 0);

-- =============================================================================
-- SEED DATA: users
-- Passwords below are bcrypt hashes of the plain-text shown in the comment.
--   user@bookstore.com   → password: user1234
--   admin@bookstore.com  → password: admin1234
-- (bcrypt cost factor 10 — generated offline)
-- =============================================================================
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1,
 'Alice Reader',
 'user@bookstore.com',
 '$2b$10$RP1xKhFcPdn1DbU7/2z7..lXk2EYSxYg80329I3TxpX3Bshalg22u',
 'user'),
(2,
 'Bob Admin',
 'admin@bookstore.com',
 '$2b$10$nhZ6FwAviUC0VL9vXTYfJeSLv3O8TolLB5FTmcYT8pna/TQir0Anm',
 'admin');

-- =============================================================================
-- VERIFICATION QUERIES (run after seed to confirm data)
-- =============================================================================
-- SELECT COUNT(*) AS total_books FROM books;                    -- should be 24
-- SELECT category, COUNT(*) AS cnt FROM books GROUP BY category;
-- SELECT id, title, featured FROM books WHERE featured = 1;     -- should be 6
-- SELECT id, name, email, role FROM users;                      -- should be 2

CREATE DATABASE IF NOT EXISTS libraryhub_db;
USE libraryhub_db;

CREATE TABLE students (
  studentId VARCHAR(20) PRIMARY KEY,
  fullName VARCHAR(120) NOT NULL,
  phoneNumber VARCHAR(30),
  email VARCHAR(120),
  department VARCHAR(80),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
  bookId VARCHAR(20) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(150) NOT NULL,
  category VARCHAR(60) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  publicationYear INT,
  description TEXT,
  coverImage VARCHAR(500),
  totalCopies INT DEFAULT 1,
  availableCopies INT DEFAULT 1,
  shelfLocation VARCHAR(40),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE borrow_records (
  recordId VARCHAR(30) PRIMARY KEY,
  studentId VARCHAR(20) NOT NULL,
  studentName VARCHAR(120) NOT NULL,
  phoneNumber VARCHAR(30),
  borrowDate DATE NOT NULL,
  dueDate DATE NOT NULL,
  returnDate DATE NULL,
  status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(studentId) ON DELETE CASCADE
);

CREATE TABLE borrow_items (
  itemId VARCHAR(30) PRIMARY KEY,
  recordId VARCHAR(30) NOT NULL,
  bookId VARCHAR(20) NOT NULL,
  quantity INT DEFAULT 1,
  returnedAt TIMESTAMP NULL,
  FOREIGN KEY (recordId) REFERENCES borrow_records(recordId) ON DELETE CASCADE,
  FOREIGN KEY (bookId) REFERENCES books(bookId) ON DELETE CASCADE
);

CREATE TABLE feedback (
  feedbackId VARCHAR(30) PRIMARY KEY,
  studentName VARCHAR(120),
  studentId VARCHAR(20),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  message TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_logs (
  logId VARCHAR(30) PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  entityType VARCHAR(50),
  entityId VARCHAR(50),
  details TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_borrow_status ON borrow_records(status);
CREATE INDEX idx_borrow_student ON borrow_records(studentId);

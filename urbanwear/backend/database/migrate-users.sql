-- Run when your users table still has legacy columns (id, password, created_at).
-- Safe when users is empty or you have backed up data.

USE urbanwear_db;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  userId VARCHAR(100) PRIMARY KEY,
  email VARCHAR(150) UNIQUE,
  passwordHash VARCHAR(255),
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  phoneNumber VARCHAR(30),
  location VARCHAR(150),
  role VARCHAR(50) DEFAULT 'customer',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

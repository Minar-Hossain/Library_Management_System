CREATE DATABASE IF NOT EXISTS urbanwear_db;
USE urbanwear_db;

-- USERS
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

-- PRODUCTS (clothing catalog)
CREATE TABLE products (
  productId VARCHAR(100) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  brand VARCHAR(100),
  category VARCHAR(50),
  subcategory VARCHAR(80),
  material VARCHAR(80),
  fitType VARCHAR(50),
  price FLOAT DEFAULT 0,
  stock INT DEFAULT 0,
  image VARCHAR(255),
  images TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- SIZE / COLOR VARIANTS
CREATE TABLE product_variants (
  variantId VARCHAR(100) PRIMARY KEY,
  productId VARCHAR(100) NOT NULL,
  size VARCHAR(20),
  color VARCHAR(50),
  stock INT DEFAULT 0,
  price FLOAT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(productId) ON DELETE CASCADE
);

-- ADMIN LOGS
CREATE TABLE admin_logs (
  logId VARCHAR(100) PRIMARY KEY,
  adminId VARCHAR(100),
  action VARCHAR(255),
  targetId VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (adminId) REFERENCES users(userId)
);

-- ORDERS
CREATE TABLE orders (
  orderId VARCHAR(100) PRIMARY KEY,
  userId VARCHAR(100),
  fullName VARCHAR(150),
  phoneNumber VARCHAR(30),
  shippingAddress TEXT,
  totalAmount FLOAT,
  status VARCHAR(50) DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(userId)
);

-- ORDER ITEMS
CREATE TABLE order_items (
  orderItemId VARCHAR(100) PRIMARY KEY,
  orderId VARCHAR(100),
  productId VARCHAR(100),
  productName VARCHAR(150),
  size VARCHAR(50),
  color VARCHAR(50),
  quantity INT,
  priceSnapshot FLOAT,
  FOREIGN KEY (orderId) REFERENCES orders(orderId) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(productId)
);

-- REVIEWS
CREATE TABLE reviews (
  reviewId VARCHAR(100) PRIMARY KEY,
  userId VARCHAR(100),
  productId VARCHAR(100),
  rating INT,
  comment TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(userId),
  FOREIGN KEY (productId) REFERENCES products(productId)
);

-- CART
CREATE TABLE cart (
  cartId VARCHAR(100) PRIMARY KEY,
  userId VARCHAR(100),
  productId VARCHAR(100),
  quantity INT DEFAULT 1,
  size VARCHAR(50),
  color VARCHAR(50),
  priceSnapshot FLOAT,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(userId),
  FOREIGN KEY (productId) REFERENCES products(productId)
);

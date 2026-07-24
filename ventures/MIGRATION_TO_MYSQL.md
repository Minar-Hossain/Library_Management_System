# Firebase to MySQL Migration Guide

This project now uses:
- React frontend (`ventures/src`)
- Node.js + Express backend (`ventures/backend`)
- MySQL database (`ventures/backend/database/schema.sql`)

## 1) What was removed from React

Firebase code was fully removed:
- Deleted `src/firebase.js`
- Removed Firebase auth/firestore imports from:
  - `src/context/AuthContext.js`
  - `src/services/authService.js`
  - `src/services/productService.js`
  - `src/services/orderService.js`
  - `src/pages/Login.js`
  - `src/pages/Signup.js`
  - `src/pages/Checkout.js`
- Removed `firebase` dependency from `package.json`

## 2) New Backend Structure

Created `backend/`:

```text
backend/
  server.js
  db.js
  .env.example
  package.json
  middleware/
    authMiddleware.js
  routes/
    authRoutes.js
    productRoutes.js
    orderRoutes.js
  database/
    schema.sql
```

## 3) Setup MySQL

1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Open and run `backend/database/schema.sql`

This creates:
- `ventures_db`
- `users`
- `products`
- `orders`
- `order_items`

## 4) Setup Backend

From project root (`ventures`):

```bash
cd backend
npm install
```

Create `.env` in `backend/` from `.env.example`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ventures_db
JWT_SECRET=replace_with_a_long_random_secret
```

Start backend:

```bash
npm run dev
```

## 5) Setup Frontend

In `ventures/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Then run frontend:

```bash
npm start
```

## 6) API Endpoints

Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (requires Bearer token)

Products:
- `GET /api/products`

Orders:
- `POST /api/orders` (requires Bearer token)
- `GET /api/orders` (requires Bearer token)

## 7) How React now connects

- React sends HTTP requests with `fetch` to Express routes.
- Backend handles auth, database writes, and reads.
- JWT token is stored in `localStorage` under `ventures_session`.
- Protected requests send:
  - `Authorization: Bearer <token>`

## 8) Verify data in MySQL Workbench

Run these queries:

```sql
USE ventures_db;

SELECT * FROM users;
SELECT * FROM products;
SELECT * FROM orders;
SELECT * FROM order_items;
```

To see joined order details:

```sql
SELECT
  o.id AS order_id,
  u.email AS user_email,
  o.total_price,
  oi.product_name,
  oi.quantity,
  oi.price
FROM orders o
JOIN users u ON u.id = o.user_id
JOIN order_items oi ON oi.order_id = o.id
ORDER BY o.created_at DESC;
```

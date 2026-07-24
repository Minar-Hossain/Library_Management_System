# URBANWEAR — Setup Guide

Full-stack clothing e-commerce migrated from Firebase (formerly VENTURES shoe store).

## Stack

- React frontend (`urbanwear/src`)
- Express + MySQL backend (`urbanwear/backend`)
- Database: `urbanwear_db` (`backend/database/schema.sql`)

## 1) MySQL

Run `backend/database/schema.sql` in MySQL Workbench to create:

- `urbanwear_db`
- `users`, `products`, `product_variants`, `orders`, `order_items`, `cart`, `reviews`, `admin_logs`

## 2) Backend

```bash
cd urbanwear/backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=urbanwear_db
JWT_SECRET=replace_with_a_long_random_secret
```

```bash
npm run dev
```

## 3) Frontend

Create `urbanwear/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
cd urbanwear
npm install
npm start
```

## 4) Routes

| Path | Page |
|------|------|
| `/` | Login |
| `/signup` | Signup |
| `/home` | Fashion homepage |
| `/category/:name` | Category listing |
| `/product/:id` | Product details |
| `/cart` | Cart |
| `/checkout` | Checkout |
| `/success` | Order success |
| `/profile` | User profile |

## 5) Auth

JWT stored in `localStorage` key `urbanwear_session`.  
Cart stored in `urbanwear_cart_v1`.

## 6) API highlights

- `GET /api/products?category=men`
- `POST /api/orders` — body: `fullName`, `phoneNumber`, `shippingAddress`, `totalAmount`, `items[]`
- `GET /api/reviews/product/:productId`

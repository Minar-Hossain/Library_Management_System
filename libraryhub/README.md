# LibraryHub — University Library Management System

A full-stack **DBMS project** for managing books, borrowing, returns, and student records.  
**No authentication** — the site is fully public.

## Tech stack

| Layer | Technologies |
|--------|----------------|
| Frontend | React, Vite, Tailwind CSS v4, Framer Motion, React Router, react-hot-toast |
| Backend | Node.js, Express |
| Database | MySQL (mysql2 connection pool) |

## Features

- Home page with hero, stats, featured books
- Book catalog (search, category filter, pagination)
- Book details + similar books
- Borrow / return workflows with stock updates
- Student borrowing records table
- Admin dashboard (CRUD books, charts) — no login
- Dark / light mode
- 76 engineering books with **unique Open Library cover images**

## Folder structure

```
libraryhub/
├── backend/
│   ├── database/schema.sql
│   ├── database/seed.js
│   ├── data/booksSeed.js
│   ├── routes/books.js, borrow.js, stats.js, feedback.js
│   ├── middleware/errorHandler.js
│   ├── db.js
│   └── server.js
└── frontend/
    └── src/
        ├── api/client.js
        ├── components/
        ├── context/ThemeContext.jsx
        └── pages/
```

## Installation

### 1. MySQL

Create the database and tables:

```bash
mysql -u root -p < backend/database/schema.sql
```

Or run the seed script (applies schema + data):

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL password
npm install
npm run seed
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

API: **http://localhost:5001**

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: **http://localhost:3000**

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Dashboard stats + charts |
| GET | `/api/books` | List books (`search`, `category`, `page`) |
| GET | `/api/books/:id` | Book details + similar |
| POST | `/api/books` | Add book |
| PUT | `/api/books/:id` | Update book |
| DELETE | `/api/books/:id` | Delete book |
| POST | `/api/borrow` | Borrow book |
| POST | `/api/borrow/return` | Return book |
| GET | `/api/borrow` | Borrowing records |
| GET | `/api/borrow/active` | Active borrows for return |

## Regenerate book seed (76 titles)

```bash
cd backend
npm run generate:books
npm run seed
```

## Notes for DBMS report

- **Normalization**: `students`, `books`, `borrow_records`, `borrow_items` (line items per borrow)
- **Transactions**: Borrow/return use `BEGIN` / `COMMIT` with row locks on stock
- **Indexes**: On `category`, `title`, `status`, `studentId`
- **Admin logs** & **feedback** tables included for extended schema marks

---

Built for university DBMS coursework — LibraryHub © 2026

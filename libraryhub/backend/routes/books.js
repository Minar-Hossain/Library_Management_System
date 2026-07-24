const express = require("express");
const db = require("../db");
const { logAdmin } = require("../utils/logAdmin");
const { newId } = require("../utils/id");

const router = express.Router();

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(query.limit, 10) || 50));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

router.get("/", async (req, res, next) => {
  try {
    const { search, category, available } = req.query;
    const { page, limit, offset } = parsePagination(req);
    const where = [];
    const params = [];

    if (search) {
      where.push("(title LIKE ? OR author LIKE ? OR isbn LIKE ?)");
      const q = `%${search.trim()}%`;
      params.push(q, q, q);
    }
    if (category) {
      where.push("category = ?");
      params.push(category);
    }
    if (available === "true") {
      where.push("availableCopies > 0");
    }

    const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [countRows] = await db.query(
      `SELECT COUNT(*) AS total FROM books ${clause}`,
      params
    );
    const total = countRows[0].total;

    const [books] = await db.query(
      `SELECT * FROM books ${clause} ORDER BY title ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/categories/list", async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT category, COUNT(*) AS count FROM books GROUP BY category ORDER BY category`
    );
    res.json({ categories: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/:bookId", async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM books WHERE bookId = ?", [req.params.bookId]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Book not found" });
    }
    const book = rows[0];

    const [similar] = await db.query(
      `SELECT bookId, title, author, category, coverImage, availableCopies, publicationYear
       FROM books WHERE category = ? AND bookId != ? LIMIT 4`,
      [book.category, book.bookId]
    );

    res.json({ book, similar });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      title,
      author,
      category,
      isbn,
      publicationYear,
      description,
      coverImage,
      totalCopies = 1,
      shelfLocation,
    } = req.body;

    if (!title?.trim() || !author?.trim() || !category?.trim()) {
      return res.status(400).json({ message: "title, author, and category are required" });
    }

    const bookId = req.body.bookId || newId("BK");
    const copies = Math.max(1, parseInt(totalCopies, 10) || 1);

    await db.query(
      `INSERT INTO books
        (bookId, title, author, category, isbn, publicationYear, description, coverImage, totalCopies, availableCopies, shelfLocation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookId,
        title.trim(),
        author.trim(),
        category.trim(),
        isbn || null,
        publicationYear || null,
        description || null,
        coverImage || null,
        copies,
        copies,
        shelfLocation || null,
      ]
    );

    await logAdmin("CREATE_BOOK", "book", bookId, title);
    res.status(201).json({ message: "Book added", bookId });
  } catch (err) {
    next(err);
  }
});

router.put("/:bookId", async (req, res, next) => {
  try {
    const {
      title,
      author,
      category,
      isbn,
      publicationYear,
      description,
      coverImage,
      totalCopies,
      availableCopies,
      shelfLocation,
    } = req.body;

    const [current] = await db.query("SELECT * FROM books WHERE bookId = ?", [req.params.bookId]);
    if (!current[0]) {
      return res.status(404).json({ message: "Book not found" });
    }

    const total = totalCopies ?? current[0].totalCopies;
    const available = availableCopies ?? current[0].availableCopies;

    await db.query(
      `UPDATE books SET title=?, author=?, category=?, isbn=?, publicationYear=?, description=?,
        coverImage=?, totalCopies=?, availableCopies=?, shelfLocation=?, updatedAt=CURRENT_TIMESTAMP
       WHERE bookId=?`,
      [
        title ?? current[0].title,
        author ?? current[0].author,
        category ?? current[0].category,
        isbn ?? current[0].isbn,
        publicationYear ?? current[0].publicationYear,
        description ?? current[0].description,
        coverImage ?? current[0].coverImage,
        total,
        available,
        shelfLocation ?? current[0].shelfLocation,
        req.params.bookId,
      ]
    );

    await logAdmin("UPDATE_BOOK", "book", req.params.bookId, title);
    res.json({ message: "Book updated" });
  } catch (err) {
    next(err);
  }
});

router.delete("/:bookId", async (req, res, next) => {
  try {
    const [result] = await db.query("DELETE FROM books WHERE bookId = ?", [req.params.bookId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    await logAdmin("DELETE_BOOK", "book", req.params.bookId, null);
    res.json({ message: "Book deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


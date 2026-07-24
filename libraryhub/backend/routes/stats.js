const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [[books]] = await db.query(
      `SELECT
        COUNT(*) AS totalBooks,
        COALESCE(SUM(totalCopies), 0) AS totalCopies,
        COALESCE(SUM(availableCopies), 0) AS availableCopies
       FROM books`
    );

    const borrowedCopies =
      Number(books.totalCopies) - Number(books.availableCopies);

    const [[students]] = await db.query(`SELECT COUNT(*) AS totalStudents FROM students`);

    const [[activeBorrows]] = await db.query(
      `SELECT COUNT(*) AS activeBorrows FROM borrow_records WHERE status = 'borrowed'`
    );

    const [featured] = await db.query(
      `SELECT bookId, title, author, category, coverImage, availableCopies, publicationYear
       FROM books WHERE availableCopies > 0 ORDER BY RAND() LIMIT 8`
    );

    const [mostBorrowed] = await db.query(
      `SELECT b.bookId, b.title, b.author, b.coverImage, COUNT(bi.itemId) AS borrowCount
       FROM borrow_items bi
       JOIN books b ON b.bookId = bi.bookId
       GROUP BY b.bookId, b.title, b.author, b.coverImage
       ORDER BY borrowCount DESC
       LIMIT 8`
    );

    const [activity] = await db.query(
      `SELECT DATE(borrowDate) AS day, COUNT(*) AS count
       FROM borrow_records
       WHERE borrowDate >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
       GROUP BY DATE(borrowDate)
       ORDER BY day ASC`
    );

    const [byCategory] = await db.query(
      `SELECT category, COUNT(*) AS count FROM books GROUP BY category ORDER BY count DESC`
    );

    res.json({
      stats: {
        totalBooks: Number(books.totalBooks),
        totalCopies: Number(books.totalCopies),
        availableCopies: Number(books.availableCopies),
        borrowedCopies,
        totalStudents: Number(students.totalStudents),
        activeBorrows: Number(activeBorrows.activeBorrows),
      },
      featured,
      charts: {
        mostBorrowed,
        activity,
        byCategory,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


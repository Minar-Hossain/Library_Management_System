const express = require("express");
const db = require("../db");
const { newId } = require("../utils/id");
const { logAdmin } = require("../utils/logAdmin");

const router = express.Router();

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

router.get("/", async (req, res, next) => {
  try {
    const { search, status, page: pageQ, limit: limitQ } = req.query;
    const page = Math.max(1, parseInt(pageQ, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(limitQ, 10) || 20));
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];

    if (status) {
      where.push("br.status = ?");
      params.push(status);
    }
    if (search) {
      where.push("(br.studentName LIKE ? OR br.studentId LIKE ? OR b.title LIKE ?)");
      const q = `%${search.trim()}%`;
      params.push(q, q, q);
    }

    const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [countRows] = await db.query(
      `SELECT COUNT(DISTINCT br.recordId) AS total
       FROM borrow_records br
       LEFT JOIN borrow_items bi ON bi.recordId = br.recordId
       LEFT JOIN books b ON b.bookId = bi.bookId
       ${clause}`,
      params
    );

    const [records] = await db.query(
      `SELECT br.*, GROUP_CONCAT(b.title SEPARATOR ', ') AS bookTitles,
              GROUP_CONCAT(b.bookId SEPARATOR ',') AS bookIds
       FROM borrow_records br
       LEFT JOIN borrow_items bi ON bi.recordId = br.recordId
       LEFT JOIN books b ON b.bookId = bi.bookId
       ${clause}
       GROUP BY br.recordId
       ORDER BY br.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      records,
      pagination: {
        page,
        limit,
        total: countRows[0].total,
        totalPages: Math.ceil(countRows[0].total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/active", async (req, res, next) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT br.recordId, br.studentId, br.studentName, br.phoneNumber, br.borrowDate, br.dueDate, br.status,
             bi.itemId, bi.bookId, b.title, b.author, b.coverImage
      FROM borrow_records br
      JOIN borrow_items bi ON bi.recordId = br.recordId AND bi.returnedAt IS NULL
      JOIN books b ON b.bookId = bi.bookId
      WHERE br.status = 'borrowed'`;
    const params = [];
    if (search) {
      sql += ` AND (br.studentId LIKE ? OR br.studentName LIKE ? OR b.title LIKE ? OR bi.bookId LIKE ?)`;
      const q = `%${search.trim()}%`;
      params.push(q, q, q, q);
    }
    sql += ` ORDER BY br.borrowDate DESC`;
    const [rows] = await db.query(sql, params);
    res.json({ borrows: rows });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { studentName, studentId, phoneNumber, bookId, notes } = req.body;

    if (!studentName?.trim() || !studentId?.trim() || !bookId) {
      return res.status(400).json({ message: "studentName, studentId, and bookId are required" });
    }

    await connection.beginTransaction();

    const [books] = await connection.query(
      "SELECT * FROM books WHERE bookId = ? FOR UPDATE",
      [bookId]
    );
    const book = books[0];
    if (!book) {
      await connection.rollback();
      return res.status(404).json({ message: "Book not found" });
    }
    if (book.availableCopies < 1) {
      await connection.rollback();
      return res.status(400).json({ message: "No copies available for this book" });
    }

    await connection.query(
      `INSERT INTO students (studentId, fullName, phoneNumber) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE fullName=VALUES(fullName), phoneNumber=VALUES(phoneNumber)`,
      [studentId.trim(), studentName.trim(), phoneNumber || null]
    );

    const recordId = newId("BR");
    const borrowDate = new Date().toISOString().slice(0, 10);
    const dueDate = addDays(borrowDate, 14);

    await connection.query(
      `INSERT INTO borrow_records (recordId, studentId, studentName, phoneNumber, borrowDate, dueDate, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'borrowed', ?)`,
      [recordId, studentId.trim(), studentName.trim(), phoneNumber || null, borrowDate, dueDate, notes || null]
    );

    const itemId = newId("BI");
    await connection.query(
      `INSERT INTO borrow_items (itemId, recordId, bookId, quantity) VALUES (?, ?, ?, 1)`,
      [itemId, recordId, bookId]
    );

    await connection.query("UPDATE books SET availableCopies = availableCopies - 1 WHERE bookId = ?", [
      bookId,
    ]);

    await connection.commit();
    await logAdmin("BORROW", "borrow_record", recordId, book.title);

    res.status(201).json({
      message: "Book borrowed successfully",
      recordId,
      dueDate,
      book: { bookId, title: book.title },
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

router.post("/return", async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { recordId, bookId, itemId } = req.body;

    if (!recordId && !itemId) {
      return res.status(400).json({ message: "recordId or itemId is required" });
    }

    await connection.beginTransaction();

    let itemRows;
    if (itemId) {
      [itemRows] = await connection.query(
        `SELECT bi.*, br.status AS recordStatus FROM borrow_items bi
         JOIN borrow_records br ON br.recordId = bi.recordId
         WHERE bi.itemId = ? AND bi.returnedAt IS NULL FOR UPDATE`,
        [itemId]
      );
    } else {
      [itemRows] = await connection.query(
        `SELECT bi.*, br.status AS recordStatus FROM borrow_items bi
         JOIN borrow_records br ON br.recordId = bi.recordId
         WHERE bi.recordId = ? AND bi.returnedAt IS NULL FOR UPDATE`,
        [recordId]
      );
    }

    const items = itemRows.filter((i) => !bookId || i.bookId === bookId);
    if (!items.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Active borrow record not found" });
    }

    const returnDate = new Date().toISOString().slice(0, 10);

    for (const item of items) {
      await connection.query(
        "UPDATE borrow_items SET returnedAt = CURRENT_TIMESTAMP WHERE itemId = ?",
        [item.itemId]
      );
      await connection.query(
        "UPDATE books SET availableCopies = availableCopies + 1 WHERE bookId = ?",
        [item.bookId]
      );
    }

    const rid = items[0].recordId;
    const [pending] = await connection.query(
      `SELECT COUNT(*) AS cnt FROM borrow_items WHERE recordId = ? AND returnedAt IS NULL`,
      [rid]
    );

    if (pending[0].cnt === 0) {
      await connection.query(
        `UPDATE borrow_records SET status = 'returned', returnDate = ? WHERE recordId = ?`,
        [returnDate, rid]
      );
    }

    await connection.commit();
    await logAdmin("RETURN", "borrow_record", rid, null);

    res.json({ message: "Book returned successfully", recordId: rid, returnDate });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

module.exports = router;


const express = require("express");
const db = require("../db");
const { newId } = require("../utils/id");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { studentName, studentId, rating, message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: "message is required" });
    }
    const r = parseInt(rating, 10);
    if (r < 1 || r > 5) {
      return res.status(400).json({ message: "rating must be 1–5" });
    }

    const feedbackId = newId("FB");
    await db.query(
      `INSERT INTO feedback (feedbackId, studentName, studentId, rating, message) VALUES (?, ?, ?, ?, ?)`,
      [feedbackId, studentName || null, studentId || null, r, message.trim()]
    );

    res.status(201).json({ message: "Thank you for your feedback", feedbackId });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM feedback ORDER BY createdAt DESC LIMIT 20`
    );
    res.json({ feedback: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


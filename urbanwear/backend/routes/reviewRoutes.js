const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { generateId } = require("../utils/id");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { productId } = req.query;
    if (productId) {
      const [reviews] = await db.query(
        "SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC",
        [productId]
      );
      return res.status(200).json({ reviews });
    }
    const [reviews] = await db.query("SELECT * FROM reviews ORDER BY createdAt DESC");
    return res.status(200).json({ reviews });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching reviews" });
  }
});

router.get("/product/:productId", async (req, res) => {
  try {
    const [reviews] = await db.query(
      "SELECT * FROM reviews WHERE productId = ? ORDER BY createdAt DESC",
      [req.params.productId]
    );
    return res.status(200).json({ reviews });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching reviews" });
  }
});

router.get("/:reviewId", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reviews WHERE reviewId = ?", [req.params.reviewId]);
    if (!rows[0]) return res.status(404).json({ message: "Review not found" });
    return res.status(200).json({ review: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching review" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;
    const ownerId = req.user.role === "admin" && userId ? userId : req.user.userId;
    const reviewId = generateId("rev");
    await db.query(
      "INSERT INTO reviews (reviewId, userId, productId, rating, comment) VALUES (?, ?, ?, ?, ?)",
      [reviewId, ownerId, productId, rating, comment || null]
    );
    return res.status(201).json({ message: "Review created", reviewId });
  } catch (error) {
    return res.status(500).json({ message: "Server error while creating review" });
  }
});

router.put("/:reviewId", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reviews WHERE reviewId = ?", [req.params.reviewId]);
    if (!rows[0]) return res.status(404).json({ message: "Review not found" });
    if (req.user.role !== "admin" && rows[0].userId !== req.user.userId) return res.status(403).json({ message: "Not allowed" });
    const { userId, productId, rating, comment } = req.body;
    const nextUserId = req.user.role === "admin" ? userId : rows[0].userId;
    await db.query(
      "UPDATE reviews SET userId = ?, productId = ?, rating = ?, comment = ? WHERE reviewId = ?",
      [nextUserId, productId, rating, comment, req.params.reviewId]
    );
    return res.status(200).json({ message: "Review updated" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while updating review" });
  }
});

router.delete("/:reviewId", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reviews WHERE reviewId = ?", [req.params.reviewId]);
    if (!rows[0]) return res.status(404).json({ message: "Review not found" });
    if (req.user.role !== "admin" && rows[0].userId !== req.user.userId) return res.status(403).json({ message: "Not allowed" });
    await db.query("DELETE FROM reviews WHERE reviewId = ?", [req.params.reviewId]);
    return res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while deleting review" });
  }
});

module.exports = router;

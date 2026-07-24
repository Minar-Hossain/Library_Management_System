const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { generateId } = require("../utils/id");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const [rows] =
      req.user.role === "admin"
        ? await db.query("SELECT * FROM cart ORDER BY updatedAt DESC")
        : await db.query("SELECT * FROM cart WHERE userId = ? ORDER BY updatedAt DESC", [req.user.userId]);
    return res.status(200).json({ cart: rows });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching cart" });
  }
});

router.get("/:cartId", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cart WHERE cartId = ?", [req.params.cartId]);
    const item = rows[0];
    if (!item) return res.status(404).json({ message: "Cart item not found" });
    if (req.user.role !== "admin" && item.userId !== req.user.userId) return res.status(403).json({ message: "Not allowed" });
    return res.status(200).json({ cartItem: item });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching cart item" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { userId, productId, quantity, size, color, priceSnapshot } = req.body;
    const ownerId = req.user.role === "admin" && userId ? userId : req.user.userId;
    const cartId = generateId("crt");
    await db.query(
      `INSERT INTO cart (cartId, userId, productId, quantity, size, color, priceSnapshot)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cartId, ownerId, productId, quantity || 1, size || null, color || null, priceSnapshot || 0]
    );
    return res.status(201).json({ message: "Cart item created", cartId });
  } catch (error) {
    return res.status(500).json({ message: "Server error while creating cart item" });
  }
});

router.put("/:cartId", authMiddleware, async (req, res) => {
  try {
    const [existingRows] = await db.query("SELECT * FROM cart WHERE cartId = ?", [req.params.cartId]);
    if (!existingRows[0]) return res.status(404).json({ message: "Cart item not found" });
    if (req.user.role !== "admin" && existingRows[0].userId !== req.user.userId) return res.status(403).json({ message: "Not allowed" });

    const { userId, productId, quantity, size, color, priceSnapshot } = req.body;
    const nextUserId = req.user.role === "admin" ? userId : existingRows[0].userId;
    await db.query(
      `UPDATE cart
       SET userId = ?, productId = ?, quantity = ?, size = ?, color = ?, priceSnapshot = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE cartId = ?`,
      [nextUserId, productId, quantity, size, color, priceSnapshot, req.params.cartId]
    );
    return res.status(200).json({ message: "Cart item updated" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while updating cart item" });
  }
});

router.delete("/:cartId", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cart WHERE cartId = ?", [req.params.cartId]);
    if (!rows[0]) return res.status(404).json({ message: "Cart item not found" });
    if (req.user.role !== "admin" && rows[0].userId !== req.user.userId) return res.status(403).json({ message: "Not allowed" });
    await db.query("DELETE FROM cart WHERE cartId = ?", [req.params.cartId]);
    return res.status(200).json({ message: "Cart item deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while deleting cart item" });
  }
});

router.delete("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(400).json({ message: "Use /:cartId for admin deletions" });
    }
    await db.query("DELETE FROM cart WHERE userId = ?", [req.user.userId]);
    return res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while clearing cart" });
  }
});

module.exports = router;

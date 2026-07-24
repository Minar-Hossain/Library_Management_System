const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { generateId } = require("../utils/id");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [products] = await db.query("SELECT * FROM products ORDER BY createdAt DESC");
    return res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching products" });
  }
});

router.get("/:productId", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products WHERE productId = ?", [req.params.productId]);
    if (!rows[0]) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ product: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching product" });
  }
});

router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      brand,
      category,
      size,
      color,
      price,
      stock,
      image,
      isActive = true,
    } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });

    const productId = generateId("prd");
    await db.query(
      `INSERT INTO products (productId, name, description, brand, category, size, color, price, stock, image, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [productId, name, description || null, brand || null, category || null, size || null, color || null, price || 0, stock || 0, image || null, Boolean(isActive)]
    );
    return res.status(201).json({ message: "Product created", productId });
  } catch (error) {
    return res.status(500).json({ message: "Server error while creating product" });
  }
});

router.put("/:productId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, brand, category, size, color, price, stock, image, isActive } = req.body;
    const [result] = await db.query(
      `UPDATE products
       SET name = ?, description = ?, brand = ?, category = ?, size = ?, color = ?, price = ?, stock = ?, image = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE productId = ?`,
      [name, description, brand, category, size, color, price, stock, image, Boolean(isActive), req.params.productId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ message: "Product updated" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while updating product" });
  }
});

router.delete("/:productId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM products WHERE productId = ?", [req.params.productId]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while deleting product" });
  }
});

module.exports = router;

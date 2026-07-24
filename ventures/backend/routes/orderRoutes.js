const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { generateId } = require("../utils/id");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { userId, fullName, phoneNumber, shippingAddress, totalAmount, status, items = [] } = req.body;
    const ownerId = req.user.role === "admin" && userId ? userId : req.user.userId;
    if (!ownerId || !fullName || !phoneNumber || !shippingAddress) {
      return res.status(400).json({ message: "userId, fullName, phoneNumber, shippingAddress are required" });
    }

    await connection.beginTransaction();
    const orderId = generateId("ord");

    const [orderResult] = await connection.query(
      `INSERT INTO orders (orderId, userId, fullName, phoneNumber, shippingAddress, totalAmount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orderId, ownerId, fullName, phoneNumber, shippingAddress, totalAmount || 0, status || "pending"]
    );

    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (orderItemId, orderId, productId, productName, size, color, quantity, priceSnapshot)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generateId("oit"),
          orderId,
          item.productId,
          item.productName,
          item.size || null,
          item.color || null,
          item.quantity || 1,
          item.priceSnapshot || 0,
        ]
      );
    }

    await connection.commit();
    return res.status(201).json({ message: "Order created", orderId, affectedRows: orderResult.affectedRows });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: "Server error while creating order" });
  } finally {
    connection.release();
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const query =
      req.user.role === "admin"
        ? "SELECT * FROM orders ORDER BY createdAt DESC"
        : "SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC";
    const params = req.user.role === "admin" ? [] : [req.user.userId];
    const [orders] = await db.query(query, params);
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching orders" });
  }
});

router.get("/record/:orderId", authMiddleware, async (req, res) => {
  try {
    const [orders] = await db.query("SELECT * FROM orders WHERE orderId = ?", [req.params.orderId]);
    const order = orders[0];
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (req.user.role !== "admin" && order.userId !== req.user.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }
    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching order" });
  }
});

router.put("/record/:orderId", authMiddleware, async (req, res) => {
  try {
    const { userId, fullName, phoneNumber, shippingAddress, totalAmount, status } = req.body;
    const [existing] = await db.query("SELECT * FROM orders WHERE orderId = ?", [req.params.orderId]);
    if (!existing[0]) return res.status(404).json({ message: "Order not found" });
    if (req.user.role !== "admin" && existing[0].userId !== req.user.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }
    await db.query(
      `UPDATE orders SET userId = ?, fullName = ?, phoneNumber = ?, shippingAddress = ?, totalAmount = ?, status = ?
       WHERE orderId = ?`,
      [userId, fullName, phoneNumber, shippingAddress, totalAmount, status, req.params.orderId]
    );
    return res.status(200).json({ message: "Order updated" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while updating order" });
  }
});

router.delete("/record/:orderId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM orders WHERE orderId = ?", [req.params.orderId]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Order not found" });
    return res.status(200).json({ message: "Order deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while deleting order" });
  }
});

router.get("/items/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [items] = await db.query("SELECT * FROM order_items");
    return res.status(200).json({ orderItems: items });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching order items" });
  }
});

router.get("/items/:orderItemId", authMiddleware, async (req, res) => {
  try {
    const [items] = await db.query("SELECT * FROM order_items WHERE orderItemId = ?", [req.params.orderItemId]);
    const item = items[0];
    if (!item) return res.status(404).json({ message: "Order item not found" });

    if (req.user.role !== "admin") {
      const [orders] = await db.query("SELECT userId FROM orders WHERE orderId = ?", [item.orderId]);
      if (!orders[0] || orders[0].userId !== req.user.userId) {
        return res.status(403).json({ message: "Not allowed" });
      }
    }

    return res.status(200).json({ orderItem: item });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching order item" });
  }
});

router.post("/items", authMiddleware, async (req, res) => {
  try {
    const { orderId, productId, productName, size, color, quantity, priceSnapshot } = req.body;
    const [orders] = await db.query("SELECT userId FROM orders WHERE orderId = ?", [orderId]);
    if (!orders[0]) return res.status(404).json({ message: "Order not found" });
    if (req.user.role !== "admin" && orders[0].userId !== req.user.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const orderItemId = generateId("oit");
    await db.query(
      `INSERT INTO order_items (orderItemId, orderId, productId, productName, size, color, quantity, priceSnapshot)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderItemId, orderId, productId, productName, size || null, color || null, quantity || 1, priceSnapshot || 0]
    );
    return res.status(201).json({ message: "Order item created", orderItemId });
  } catch (error) {
    return res.status(500).json({ message: "Server error while creating order item" });
  }
});

router.put("/items/:orderItemId", authMiddleware, async (req, res) => {
  try {
    const [existingRows] = await db.query("SELECT * FROM order_items WHERE orderItemId = ?", [req.params.orderItemId]);
    const existingItem = existingRows[0];
    if (!existingItem) return res.status(404).json({ message: "Order item not found" });

    const [orders] = await db.query("SELECT userId FROM orders WHERE orderId = ?", [existingItem.orderId]);
    if (req.user.role !== "admin" && (!orders[0] || orders[0].userId !== req.user.userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { orderId, productId, productName, size, color, quantity, priceSnapshot } = req.body;
    await db.query(
      `UPDATE order_items
       SET orderId = ?, productId = ?, productName = ?, size = ?, color = ?, quantity = ?, priceSnapshot = ?
       WHERE orderItemId = ?`,
      [orderId, productId, productName, size, color, quantity, priceSnapshot, req.params.orderItemId]
    );
    return res.status(200).json({ message: "Order item updated" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while updating order item" });
  }
});

router.delete("/items/:orderItemId", authMiddleware, async (req, res) => {
  try {
    const [existingRows] = await db.query("SELECT * FROM order_items WHERE orderItemId = ?", [req.params.orderItemId]);
    const existingItem = existingRows[0];
    if (!existingItem) return res.status(404).json({ message: "Order item not found" });

    const [orders] = await db.query("SELECT userId FROM orders WHERE orderId = ?", [existingItem.orderId]);
    if (req.user.role !== "admin" && (!orders[0] || orders[0].userId !== req.user.userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await db.query("DELETE FROM order_items WHERE orderItemId = ?", [req.params.orderItemId]);
    return res.status(200).json({ message: "Order item deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while deleting order item" });
  }
});

module.exports = router;

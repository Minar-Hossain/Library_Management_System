const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { generateId } = require("../utils/id");

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [logs] = await db.query("SELECT * FROM admin_logs ORDER BY createdAt DESC");
    return res.status(200).json({ admin_logs: logs });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching admin logs" });
  }
});

router.get("/:logId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM admin_logs WHERE logId = ?", [req.params.logId]);
    if (!rows[0]) return res.status(404).json({ message: "Admin log not found" });
    return res.status(200).json({ admin_log: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching admin log" });
  }
});

router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { adminId, action, targetId } = req.body;
    const logId = generateId("log");
    await db.query(
      "INSERT INTO admin_logs (logId, adminId, action, targetId) VALUES (?, ?, ?, ?)",
      [logId, adminId || req.user.userId, action, targetId || null]
    );
    return res.status(201).json({ message: "Admin log created", logId });
  } catch (error) {
    return res.status(500).json({ message: "Server error while creating admin log" });
  }
});

router.put("/:logId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { adminId, action, targetId } = req.body;
    const [result] = await db.query(
      "UPDATE admin_logs SET adminId = ?, action = ?, targetId = ? WHERE logId = ?",
      [adminId, action, targetId, req.params.logId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "Admin log not found" });
    return res.status(200).json({ message: "Admin log updated" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while updating admin log" });
  }
});

router.delete("/:logId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM admin_logs WHERE logId = ?", [req.params.logId]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Admin log not found" });
    return res.status(200).json({ message: "Admin log deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while deleting admin log" });
  }
});

module.exports = router;

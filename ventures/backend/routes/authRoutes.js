const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { generateId } = require("../utils/id");

const router = express.Router();

function buildToken(user) {
  return jwt.sign(
    { userId: user.userId, email: user.email, role: user.role },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res) => {
  let connection;
  let transactionStarted = false;
  try {
    connection = await db.getConnection();
    const payload = req.body || {};
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    const phoneNumber = payload.phoneNumber ? String(payload.phoneNumber).trim() : null;
    const location = payload.location ? String(payload.location).trim() : null;
    const role = payload.role ? String(payload.role).trim() : "customer";

    const nameParts = String(payload.name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const firstName = String(payload.firstName || nameParts[0] || "").trim();
    const lastName = String(payload.lastName || nameParts.slice(1).join(" ") || "User").trim();

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "email, password, firstName, lastName are required" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const [existing] = await connection.query("SELECT userId FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    await connection.beginTransaction();
    transactionStarted = true;
    const userId = generateId("usr");
    const passwordHash = await bcrypt.hash(password, 10);

    await connection.query(
      `INSERT INTO users (userId, email, passwordHash, firstName, lastName, phoneNumber, location, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        email,
        passwordHash,
        firstName,
        lastName,
        phoneNumber,
        location,
        role,
      ]
    );
    await connection.commit();

    const user = {
      userId,
      firstName,
      lastName,
      email,
      phoneNumber: phoneNumber || "",
      location: location || "",
      role,
    };
    const token = buildToken(user);
    return res.status(201).json({ message: "User registered", token, user });
  } catch (error) {
    if (transactionStarted && connection) {
      await connection.rollback();
    }

    console.error("Register error:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
    });

    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      return res.status(500).json({ message: "Database authentication failed. Check DB_USER/DB_PASSWORD in backend/.env" });
    }

    if (error.code === "ER_BAD_FIELD_ERROR") {
      return res.status(500).json({ message: "Users table schema mismatch. Verify passwordHash/firstName/lastName columns exist." });
    }

    return res.status(500).json({ message: "Server error during registration" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [users] = await db.query(
      `SELECT userId, email, passwordHash, firstName, lastName, phoneNumber, location, role
       FROM users
       WHERE email = ?`,
      [email.trim()]
    );
    const userRow = users[0];
    if (!userRow) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, userRow.passwordHash || "");
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = {
      userId: userRow.userId,
      firstName: userRow.firstName,
      lastName: userRow.lastName,
      email: userRow.email,
      phoneNumber: userRow.phoneNumber || "",
      location: userRow.location || "",
      role: userRow.role,
    };
    const token = buildToken(user);
    return res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    return res.status(500).json({ message: "Server error during login" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT userId, email, firstName, lastName, phoneNumber, location, role, createdAt, updatedAt FROM users WHERE userId = ?",
      [req.user.userId]
    );
    const user = users[0];
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching profile" });
  }
});

router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT userId, email, firstName, lastName, phoneNumber, location, role, createdAt, updatedAt FROM users ORDER BY createdAt DESC"
    );
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching users" });
  }
});

router.get("/users/:userId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const [users] = await db.query(
      "SELECT userId, email, firstName, lastName, phoneNumber, location, role, createdAt, updatedAt FROM users WHERE userId = ?",
      [req.params.userId]
    );
    if (!users[0]) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user: users[0] });
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching user" });
  }
});

router.put("/users/:userId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { email, password, firstName, lastName, phoneNumber, location, role } = req.body;
    const [currentRows] = await db.query("SELECT * FROM users WHERE userId = ?", [req.params.userId]);
    const current = currentRows[0];
    if (!current) {
      return res.status(404).json({ message: "User not found" });
    }

    let nextPasswordHash = current.passwordHash;
    if (password) {
      if (String(password).length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      nextPasswordHash = await bcrypt.hash(password, 10);
    }

    const nextRole = req.user.role === "admin" ? role : current.role;
    await db.query(
      `UPDATE users
       SET email = ?, passwordHash = ?, firstName = ?, lastName = ?, phoneNumber = ?, location = ?, role = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE userId = ?`,
      [
        email ?? current.email,
        nextPasswordHash,
        firstName ?? current.firstName,
        lastName ?? current.lastName,
        phoneNumber ?? current.phoneNumber,
        location ?? current.location,
        nextRole ?? current.role,
        req.params.userId,
      ]
    );

    return res.status(200).json({ message: "User updated" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while updating user" });
  }
});

router.delete("/users/:userId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM users WHERE userId = ?", [req.params.userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error while deleting user" });
  }
});

module.exports = router;

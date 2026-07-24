const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { validateRegisterInput, normalizeEmail } = require("../utils/validateAuth");

const router = express.Router();
const BCRYPT_ROUNDS = 10;

function buildToken(user) {
  return jwt.sign(
    { userId: user.userId, email: user.email, role: user.role },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );
}

function mapMysqlError(error) {
  if (error.code === "ER_DUP_ENTRY") {
    return { status: 409, message: "Email already exists" };
  }
  if (error.code === "ER_BAD_FIELD_ERROR") {
    return {
      status: 500,
      message:
        "Users table schema mismatch. Run database/migrate-users.sql so columns match userId and passwordHash.",
    };
  }
  if (error.code === "ER_NO_SUCH_TABLE") {
    return { status: 500, message: "Users table not found. Run database/schema.sql first." };
  }
  if (error.code === "ER_ACCESS_DENIED_ERROR") {
    return {
      status: 500,
      message: "Database authentication failed. Check DB_USER and DB_PASSWORD in backend/.env",
    };
  }
  return { status: 500, message: "Server error during registration" };
}

router.post("/register", async (req, res) => {
  const validation = validateRegisterInput(req.body || {});
  if (!validation.ok) {
    return res.status(validation.status).json({ message: validation.message });
  }

  const { email, password, firstName, lastName, phoneNumber, location, role } = validation.data;

  let connection;
  try {
    const [existingRows] = await db.query("SELECT userId FROM users WHERE email = ? LIMIT 1", [email]);
    if (existingRows.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    connection = await db.getConnection();
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO users
        (userId, email, passwordHash, firstName, lastName, phoneNumber, location, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, email, passwordHash, firstName, lastName, phoneNumber, location, role]
    );

    await connection.commit();

    const user = {
      userId,
      email,
      firstName,
      lastName,
      phoneNumber: phoneNumber || "",
      location: location || "",
      role,
    };

    return res.status(201).json({
      message: "User registered successfully",
      token: buildToken(user),
      user,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Register rollback error:", rollbackError.message);
      }
    }

    console.error("Register error:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
    });

    const mapped = mapMysqlError(error);
    return res.status(mapped.status).json({ message: mapped.message });
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
      [normalizeEmail(email)]
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

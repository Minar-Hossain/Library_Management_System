require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const booksRoutes = require("./routes/books");
const borrowRoutes = require("./routes/borrow");
const statsRoutes = require("./routes/stats");
const feedbackRoutes = require("./routes/feedback");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "LibraryHub API is running", docs: "/api/health" });
});

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok", database: process.env.DB_NAME || "libraryhub_db" });
  } catch (e) {
    res.status(503).json({ status: "error", message: e.message });
  }
});

app.use("/api/books", booksRoutes);
app.use("/api/borrow", borrowRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/feedback", feedbackRoutes);

app.use(notFound);
app.use(errorHandler);

(async () => {
  try {
    const conn = await db.getConnection();
    console.log(`MySQL connected — ${process.env.DB_NAME || "libraryhub_db"}`);
    conn.release();
  } catch (err) {
    console.error("MySQL connection failed:", err.message);
  }
})();

app.listen(PORT, () => {
  console.log(`LibraryHub API → http://localhost:${PORT}`);
});


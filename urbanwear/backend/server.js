const db = require("./db");

(async () => {
  try {
    const conn = await db.getConnection();
    console.log("✅ MySQL connected — urbanwear_db");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL connection failed");
    console.error(err.message);
  }
})();

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminLogRoutes = require("./routes/adminLogRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.0.108:3000"],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "URBANWEAR backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin-logs", adminLogRoutes);

app.listen(PORT, () => {
  console.log(`URBANWEAR API → http://localhost:${PORT}`);
});

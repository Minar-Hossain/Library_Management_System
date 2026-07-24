const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { generateId } = require("../utils/id");
const { formatProductRow } = require("../utils/productFormat");

const router = express.Router();

let variantsTableAvailable = null;

async function checkVariantsTable() {
  if (variantsTableAvailable !== null) {
    return variantsTableAvailable;
  }
  try {
    const [rows] = await db.query("SHOW TABLES LIKE 'product_variants'");
    variantsTableAvailable = rows.length > 0;
  } catch {
    variantsTableAvailable = false;
  }
  return variantsTableAvailable;
}

async function attachVariants(products) {
  if (!products.length) {
    return products.map((row) => formatProductRow(row, []));
  }

  const formatted = products.map((row) => formatProductRow(row, []));

  const hasVariantsTable = await checkVariantsTable();
  if (!hasVariantsTable) {
    return formatted;
  }

  try {
    const ids = products.map((p) => p.productId);
    const placeholders = ids.map(() => "?").join(",");
    const [variants] = await db.query(
      `SELECT variantId, productId, size, color, stock, price, createdAt
       FROM product_variants
       WHERE productId IN (${placeholders})`,
      ids
    );

    const byProduct = variants.reduce((acc, variant) => {
      if (!acc[variant.productId]) {
        acc[variant.productId] = [];
      }
      acc[variant.productId].push(variant);
      return acc;
    }, {});

    return products.map((row) => formatProductRow(row, byProduct[row.productId] || []));
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      variantsTableAvailable = false;
      return formatted;
    }
    throw error;
  }
}

function logRouteError(routeName, error) {
  console.error(`[${routeName}]`, {
    message: error.message,
    code: error.code,
    errno: error.errno,
    sqlMessage: error.sqlMessage,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
}

router.get("/", async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    let sql = "SELECT * FROM products WHERE isActive = 1";
    const params = [];

    if (category) {
      sql += " AND category = ?";
      params.push(String(category).trim());
    }
    if (subcategory) {
      sql += " AND subcategory = ?";
      params.push(String(subcategory).trim());
    }

    sql += " ORDER BY createdAt DESC";

    const [rows] = await db.query(sql, params);
    const products = await attachVariants(rows);

    return res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    logRouteError("GET /api/products", error);
    return res.status(500).json({ message: "Server error while fetching products" });
  }
});

router.get("/:productId", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products WHERE productId = ?", [
      req.params.productId,
    ]);

    if (!rows[0]) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [product] = await attachVariants([rows[0]]);
    return res.status(200).json({ product });
  } catch (error) {
    logRouteError("GET /api/products/:productId", error);
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
      subcategory,
      material,
      fitType,
      price,
      stock,
      image,
      images,
      isActive = true,
      variants = [],
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const productId = generateId("prd");
    const imagesJson = Array.isArray(images) ? JSON.stringify(images) : null;

    await db.query(
      `INSERT INTO products
        (productId, name, description, brand, category, subcategory, material, fitType, price, stock, image, images, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        name,
        description || null,
        brand || null,
        category || null,
        subcategory || null,
        material || null,
        fitType || null,
        price ?? 0,
        stock ?? 0,
        image || null,
        imagesJson,
        Boolean(isActive),
      ]
    );

    if (variants.length > 0 && (await checkVariantsTable())) {
      for (const variant of variants) {
        await db.query(
          `INSERT INTO product_variants (variantId, productId, size, color, stock, price)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [generateId("var"), productId, variant.size, variant.color, variant.stock || 0, variant.price ?? price]
        );
      }
    }

    const [rows] = await db.query("SELECT * FROM products WHERE productId = ?", [productId]);
    const [product] = await attachVariants([rows[0]]);

    return res.status(201).json({ message: "Product created", productId, product });
  } catch (error) {
    logRouteError("POST /api/products", error);
    return res.status(500).json({ message: "Server error while creating product" });
  }
});

router.put("/:productId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      brand,
      category,
      subcategory,
      material,
      fitType,
      price,
      stock,
      image,
      images,
      isActive,
    } = req.body;

    const imagesJson = images === undefined ? undefined : Array.isArray(images) ? JSON.stringify(images) : null;

    const [result] = await db.query(
      `UPDATE products
       SET name = ?, description = ?, brand = ?, category = ?, subcategory = ?, material = ?, fitType = ?,
           price = ?, stock = ?, image = ?, images = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE productId = ?`,
      [
        name,
        description,
        brand,
        category,
        subcategory,
        material,
        fitType,
        price,
        stock,
        image,
        imagesJson,
        Boolean(isActive),
        req.params.productId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product updated" });
  } catch (error) {
    logRouteError("PUT /api/products/:productId", error);
    return res.status(500).json({ message: "Server error while updating product" });
  }
});

router.delete("/:productId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM products WHERE productId = ?", [req.params.productId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    logRouteError("DELETE /api/products/:productId", error);
    return res.status(500).json({ message: "Server error while deleting product" });
  }
});

module.exports = router;

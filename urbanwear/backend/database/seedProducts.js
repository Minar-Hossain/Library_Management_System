/**
 * Seed UrbanWear products into MySQL.
 * Run: npm run seed:products
 *
 * images column (TEXT) must store JSON string: JSON.stringify(["url1","url2"])
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const db = require("../db");
const products = require("../data/productsSeed");

function serializeImages(images) {
  if (!images) return null;
  if (Array.isArray(images)) {
    return JSON.stringify(images);
  }
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? JSON.stringify(parsed) : null;
    } catch {
      return JSON.stringify([images]);
    }
  }
  return null;
}

async function seed() {
  let inserted = 0;
  for (const p of products) {
    const imagesJson = serializeImages(p.images);
    await db.query(
      `INSERT INTO products
        (productId, name, description, brand, category, subcategory, material, fitType, price, stock, image, images, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        description = VALUES(description),
        brand = VALUES(brand),
        category = VALUES(category),
        subcategory = VALUES(subcategory),
        material = VALUES(material),
        fitType = VALUES(fitType),
        price = VALUES(price),
        stock = VALUES(stock),
        image = VALUES(image),
        images = VALUES(images),
        isActive = VALUES(isActive),
        updatedAt = CURRENT_TIMESTAMP`,
      [
        p.productId,
        p.name,
        p.description,
        p.brand,
        p.category,
        p.subcategory,
        p.material,
        p.fitType,
        p.price,
        p.stock,
        p.image || (imagesJson ? JSON.parse(imagesJson)[0] : null),
        imagesJson,
        p.isActive !== false,
      ]
    );
    inserted += 1;
  }
  console.log(`Seeded ${inserted} products into ${process.env.DB_NAME || "urbanwear_db"}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const db = require("../db");
const books = require("../data/booksSeed");

async function runSqlFile(filePath, connection) {
  const sql = fs.readFileSync(filePath, "utf8");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("--"));
  for (const stmt of statements) {
    await connection.query(stmt);
  }
}

async function seed() {
  const bootstrap = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  const schemaPath = path.join(__dirname, "schema.sql");
try {
  console.log("Applying schema...");
  await runSqlFile(schemaPath, bootstrap);
} catch (err) {
  console.log("Schema already exists. Skipping schema creation...");
}

await bootstrap.end();

  console.log("Seeding books...");
  for (const b of books) {
    await db.query(
      `INSERT INTO books
        (bookId, title, author, category, isbn, publicationYear, description, coverImage, totalCopies, availableCopies, shelfLocation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        title=VALUES(title), author=VALUES(author), category=VALUES(category),
        publicationYear=VALUES(publicationYear), description=VALUES(description),
        coverImage=VALUES(coverImage), totalCopies=VALUES(totalCopies),
        availableCopies=VALUES(availableCopies), shelfLocation=VALUES(shelfLocation)`,
      [
        b.bookId,
        b.title,
        b.author,
        b.category,
        b.isbn,
        b.publicationYear,
        b.description,
        b.coverImage,
        b.totalCopies,
        b.availableCopies,
        b.shelfLocation,
      ]
    );
  }

  console.log(`Seeded ${books.length} books into ${process.env.DB_NAME || "libraryhub_db"}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});


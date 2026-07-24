const db = require("../db");
const { newId } = require("./id");

async function logAdmin(action, entityType, entityId, details) {
  try {
    await db.query(
      `INSERT INTO admin_logs (logId, action, entityType, entityId, details) VALUES (?, ?, ?, ?, ?)`,
      [newId("log"), action, entityType || null, entityId || null, details || null]
    );
  } catch (e) {
    console.warn("admin_log failed:", e.message);
  }
}

module.exports = { logAdmin };


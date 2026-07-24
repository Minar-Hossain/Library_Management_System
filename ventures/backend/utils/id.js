const { randomUUID } = require("crypto");

function generateId(prefix) {
  return `${prefix}_${randomUUID()}`;
}

module.exports = { generateId };

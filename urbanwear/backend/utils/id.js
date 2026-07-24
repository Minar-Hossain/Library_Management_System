const { v4: uuidv4 } = require("uuid");

function generateId(prefix) {
  if (prefix) {
    return `${prefix}_${uuidv4()}`;
  }
  return uuidv4();
}

module.exports = { generateId, uuidv4 };

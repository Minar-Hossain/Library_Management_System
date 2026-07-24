function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error("[API Error]", {
    message: err.message,
    code: err.code,
    sqlMessage: err.sqlMessage,
    path: req.originalUrl,
  });

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "Duplicate record — ID or ISBN already exists." });
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({ message: "Referenced record does not exist." });
  }
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  return res.status(500).json({ message: err.message || "Internal server error" });
}

module.exports = { notFound, errorHandler };


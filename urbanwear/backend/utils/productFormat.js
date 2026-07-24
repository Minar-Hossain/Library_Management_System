/**
 * Normalize product rows from MySQL for API responses.
 */

function parseImagesColumn(value) {
  if (value == null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter((url) => typeof url === "string" && url.trim());
  }

  if (typeof value === "object") {
    return [];
  }

  const raw = String(value).trim();

  if (raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((url) => typeof url === "string" && url.trim());
      }
    } catch {
      return [];
    }
  }

  if (raw.startsWith("http")) {
    return [raw];
  }

  return [];
}

function formatProductRow(row, variants = []) {
  const images = parseImagesColumn(row.images);
  const image = row.image || images[0] || null;

  return {
    productId: row.productId,
    name: row.name,
    description: row.description,
    brand: row.brand,
    category: row.category,
    subcategory: row.subcategory,
    material: row.material,
    fitType: row.fitType,
    price: Number(row.price ?? 0),
    stock: Number(row.stock ?? 0),
    image,
    images: images.length > 0 ? images : image ? [image] : [],
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    variants: Array.isArray(variants) ? variants : [],
  };
}

module.exports = {
  parseImagesColumn,
  formatProductRow,
};

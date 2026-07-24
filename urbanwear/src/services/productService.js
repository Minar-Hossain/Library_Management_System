const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const BASE_DESCRIPTION =
  "Modern streetwear crafted for everyday comfort — premium fabric, clean silhouette, and a fit made for urban life.";

export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
export const DEFAULT_COLORS = ["Black", "White", "Navy", "Olive", "Sand", "Charcoal"];

/** Nav categories — values must match MySQL `products.category` column */
export const CATEGORIES = [
  { label: "Shop All", value: "all", path: "/category/all" },
  { label: "Hoodies", value: "hoodie", path: "/category/hoodie" },
  { label: "T-Shirts", value: "tshirt", path: "/category/tshirt" },
  { label: "Jeans", value: "jeans", path: "/category/jeans" },
  { label: "Jackets", value: "jacket", path: "/category/jacket" },
  { label: "Shoes", value: "shoes", path: "/category/shoes" },
  { label: "Watches", value: "watch", path: "/category/watch" },
  { label: "Caps", value: "cap", path: "/category/cap" },
  { label: "Shirts", value: "shirt", path: "/category/shirt" },
];

export const CATALOG_CATEGORIES = CATEGORIES.filter((c) => c.value !== "all").map((c) => c.value);

const rawProducts = [
  { id: "uw-001", name: "Classic Cotton Tee", category: "tshirt", subcategory: "crew-neck", brand: "URBANWEAR", price: 29, material: "cotton", fitType: "regular" },
  { id: "uw-002", name: "Oversized Hoodie", category: "hoodie", subcategory: "oversized", brand: "URBANWEAR", price: 59, material: "cotton blend", fitType: "oversized" },
];

function buildVariants(product) {
  const colors = ["watch", "cap"].includes(product.category)
    ? ["Black", "Brown"]
    : DEFAULT_COLORS.slice(0, 4);
  const sizes = ["shoes", "watch", "cap"].includes(product.category)
    ? ["One Size"]
    : CLOTHING_SIZES;
  return sizes.flatMap((size) =>
    colors.map((color) => ({
      size,
      color,
      stock: 12,
      price: product.price,
    }))
  );
}

export const fallbackProducts = rawProducts.map((item) => ({
  ...item,
  type: "clothing",
  image: "/assets/products/placeholder.svg",
  images: ["/assets/products/placeholder.svg"],
  description: `${BASE_DESCRIPTION} ${item.material} · ${item.fitType} fit.`,
  variants: buildVariants(item),
}));

export const isValidProduct = (product) =>
  product &&
  typeof product.id === "string" &&
  typeof product.name === "string" &&
  CATALOG_CATEGORIES.includes(product.category) &&
  product.type === "clothing" &&
  typeof product.price === "number" &&
  typeof product.image === "string" &&
  product.image.length > 0;

export const safeProducts = (products) => (products || []).filter(isValidProduct);

export const shuffleProducts = (products) => [...products].sort(() => Math.random() - 0.5);

function normalizeImages(row) {
  if (Array.isArray(row.images)) {
    return row.images.filter((url) => typeof url === "string" && url.trim());
  }
  if (!row.images) {
    return [];
  }
  if (typeof row.images === "string") {
    try {
      const parsed = JSON.parse(row.images);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return row.images.startsWith("http") ? [row.images] : [];
    }
  }
  return [];
}

function mapApiProduct(row) {
  const images = normalizeImages(row);

  const variants = (row.variants || []).map((v) => ({
    size: v.size,
    color: v.color,
    stock: v.stock,
    price: v.price ?? row.price,
  }));

  const image = row.image || images[0] || "";

  return {
    id: row.productId || String(row.id),
    name: row.name,
    description: row.description || BASE_DESCRIPTION,
    brand: row.brand,
    category: row.category,
    subcategory: row.subcategory,
    material: row.material,
    fitType: row.fitType,
    type: "clothing",
    price: Number(row.price),
    stock: Number(row.stock || 0),
    image,
    images: images.length > 0 ? images : image ? [image] : [],
    variants: variants.length ? variants : buildVariants(row),
  };
}

export async function fetchProducts({ category, subcategory } = {}) {
  try {
    const params = new URLSearchParams();
    const apiCategory = category && category !== "all" ? category : undefined;
    if (apiCategory) {
      params.set("category", apiCategory);
    }
    if (subcategory) {
      params.set("subcategory", subcategory);
    }
    const qs = params.toString();
    const response = await fetch(`${API_BASE_URL}/products${qs ? `?${qs}` : ""}`);
    if (!response.ok) {
      throw new Error("Unable to load products");
    }
    const payload = await response.json();
    const products = safeProducts((payload.products || []).map(mapApiProduct));
    if (products.length > 0) {
      return products;
    }
  } catch (error) {
    console.warn("fetchProducts: API unavailable, using fallback", error?.message);
  }

  let list = safeProducts(fallbackProducts);
  if (category && category !== "all") {
    list = list.filter((p) => p.category === category);
  }
  if (subcategory) {
    list = list.filter((p) => p.subcategory === subcategory);
  }
  return list;
}

export async function fetchProductById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`);
    if (!response.ok) {
      throw new Error("Product not found");
    }
    const payload = await response.json();
    const product = mapApiProduct(payload.product || {});
    if (isValidProduct(product)) {
      return product;
    }
  } catch (error) {
    console.warn("fetchProductById:", error?.message);
  }
  return safeProducts(fallbackProducts).find((p) => p.id === String(id)) || null;
}

/** @deprecated use fetchProductById */
export function getProductById(id) {
  return fetchProductById(id);
}

export function getSizesForProduct(product) {
  const fromVariants = [...new Set((product?.variants || []).map((v) => v.size).filter(Boolean))];
  return fromVariants.length ? fromVariants : CLOTHING_SIZES;
}

export function getColorsForProduct(product) {
  const fromVariants = [...new Set((product?.variants || []).map((v) => v.color).filter(Boolean))];
  return fromVariants.length ? fromVariants : DEFAULT_COLORS.slice(0, 4);
}

export function filterProducts(products, { category, subcategory, search, fitType, material }) {
  return safeProducts(products).filter((p) => {
    if (category && category !== "all" && p.category !== category) {
      return false;
    }
    if (subcategory && p.subcategory !== subcategory) {
      return false;
    }
    if (fitType && p.fitType?.toLowerCase() !== fitType.toLowerCase()) {
      return false;
    }
    if (material && !p.material?.toLowerCase().includes(material.toLowerCase())) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const hay = `${p.name} ${p.brand} ${p.subcategory} ${p.description} ${p.category}`.toLowerCase();
      if (!hay.includes(q)) {
        return false;
      }
    }
    return true;
  });
}

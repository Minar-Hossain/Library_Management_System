const BASE_DESCRIPTION =
  "Engineered for daily motion, this premium VENTURES shoe blends lightweight comfort with durable street-ready construction.";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const rawProducts = [
  { id: 1, name: "Bata ZHA", category: "men", type: "shoes", price: 89, image: "/assets/products/shoes/shoe-01.svg" },
  { id: 2, name: "Bata RM", category: "men", type: "shoes", price: 95, image: "/assets/products/shoes/shoe-02.svg" },
  { id: 3, name: "Bata AirLite", category: "men", type: "shoes", price: 99, image: "/assets/products/shoes/shoe-03.svg" },
  { id: 4, name: "VENTURES Urban X", category: "men", type: "shoes", price: 109, image: "/assets/products/shoes/shoe-04.svg" },
  { id: 5, name: "VENTURES Runner Pro", category: "men", type: "shoes", price: 115, image: "/assets/products/shoes/shoe-05.svg" },
  { id: 6, name: "VENTURES Apex Move", category: "women", type: "shoes", price: 98, image: "/assets/products/shoes/shoe-06.svg" },
  { id: 7, name: "Bata Nova Flex", category: "women", type: "shoes", price: 102, image: "/assets/products/shoes/shoe-07.svg" },
  { id: 8, name: "VENTURES Luna Step", category: "women", type: "shoes", price: 106, image: "/assets/products/shoes/shoe-08.svg" },
  { id: 9, name: "VENTURES Glide Prime", category: "women", type: "shoes", price: 112, image: "/assets/products/shoes/shoe-09.svg" },
  { id: 10, name: "Bata SilkRun", category: "women", type: "shoes", price: 93, image: "/assets/products/shoes/shoe-10.svg" },
  { id: 11, name: "VENTURES Tiny Dash", category: "children", type: "shoes", price: 62, image: "/assets/products/shoes/shoe-11.svg" },
  { id: 12, name: "Bata Kid Sprint", category: "children", type: "shoes", price: 58, image: "/assets/products/shoes/shoe-12.svg" },
  { id: 13, name: "VENTURES Mini Bolt", category: "children", type: "shoes", price: 65, image: "/assets/products/shoes/shoe-13.svg" },
  { id: 14, name: "Bata PlayRun", category: "children", type: "shoes", price: 60, image: "/assets/products/shoes/shoe-14.svg" },
  { id: 15, name: "VENTURES Junior Core", category: "children", type: "shoes", price: 67, image: "/assets/products/shoes/shoe-15.svg" },
  { id: 16, name: "VENTURES Lace Kit", category: "accessories", type: "shoes", price: 24, image: "/assets/products/shoes/shoe-16.svg" },
  { id: 17, name: "Bata Insole Max", category: "accessories", type: "shoes", price: 21, image: "/assets/products/shoes/shoe-17.svg" },
  { id: 18, name: "VENTURES Sole Guard", category: "accessories", type: "shoes", price: 29, image: "/assets/products/shoes/shoe-18.svg" },
  { id: 19, name: "Bata Grip Pack", category: "accessories", type: "shoes", price: 19, image: "/assets/products/shoes/shoe-19.svg" },
  { id: 20, name: "VENTURES Care Pro", category: "accessories", type: "shoes", price: 27, image: "/assets/products/shoes/shoe-20.svg" },
];

export const fallbackProducts = rawProducts.map((item) => ({
  ...item,
  image: `https://loremflickr.com/900/900/shoes?lock=${item.id}`,
  description: BASE_DESCRIPTION,
}));

const allowedCategories = ["men", "women", "children", "accessories"];

const isValidProductShape = (product) =>
  typeof product?.id === "number" &&
  typeof product?.name === "string" &&
  allowedCategories.includes(product?.category) &&
  product?.type === "shoes" &&
  typeof product?.price === "number" &&
  typeof product?.image === "string";

export const safeProducts = (products) =>
  products
    .filter(
      (p) =>
        p.type === "shoes" &&
        (p.image.includes("/assets/products/shoes/") || p.image.includes("loremflickr.com"))
    )
    .filter(isValidProductShape);

export const shuffleProducts = (products) => [...products].sort(() => Math.random() - 0.5);

export async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error("Unable to load products");
    }
    const payload = await response.json();
    const products = (payload.products || []).map((product) => {
      return {
        id: Number(product.id),
        name: product.name,
        category: product.category,
        type: product.type,
        price: Number(product.price),
        image: product.image,
        description: product.description || BASE_DESCRIPTION,
      };
    });

    const validatedProducts = safeProducts(products);
    if (validatedProducts.length > 0) {
      return validatedProducts;
    }
  } catch (error) {
    // Fall back to validated local shoe catalog.
  }

  return safeProducts(fallbackProducts);
}

export const getProductById = (id) => safeProducts(fallbackProducts).find((product) => product.id === Number(id));

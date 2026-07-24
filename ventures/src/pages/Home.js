import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { fetchProducts, safeProducts, shuffleProducts } from "../services/productService";

const filterOptions = [
  { label: "All Products", value: "all" },
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Children", value: "children" },
  { label: "Accessories", value: "accessories" },
];

function Home() {
  const [products, setProducts] = useState([]);
  const [viewProducts, setViewProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const loadedProducts = await fetchProducts();
      setProducts(loadedProducts);
      setViewProducts(shuffleProducts(safeProducts(loadedProducts)));
      setIsLoading(false);
    }

    loadProducts();
  }, []);

  const handleCategoryChange = (event) => {
    const nextCategory = event.target.value;
    setSelectedCategory(nextCategory);

    const validated = safeProducts(products);
    if (nextCategory === "all") {
      setViewProducts(shuffleProducts(validated));
      return;
    }

    setViewProducts(validated.filter((product) => product.category === nextCategory));
  };

  return (
    <div className="page-shell">
      <Navbar />
      
      <section className="products-section">
        <div className="section-head">
          <h2>Featured Collection</h2>
          <p>{isLoading ? "Loading shoes..." : `${viewProducts.length} shoes available`}</p>
        </div>
        <div className="filter-bar">
          <label htmlFor="category-filter">Category</label>
          <select id="category-filter" value={selectedCategory} onChange={handleCategoryChange}>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="products-grid">
          {viewProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Home;

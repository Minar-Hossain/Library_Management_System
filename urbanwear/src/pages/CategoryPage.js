import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FilterSidebar from "../components/FilterSidebar";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { CATEGORIES, fetchProducts, filterProducts, safeProducts } from "../services/productService";

const categoryLabels = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

function CategoryPage() {
  const { name } = useParams();
  const category = name || "all";
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category,
    subcategory: "",
    search: "",
    fitType: "",
    material: "",
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, category }));
  }, [category]);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const loaded = await fetchProducts({ category });
      setProducts(loaded);
      setIsLoading(false);
    }
    load();
  }, [category]);

  const viewProducts = useMemo(() => filterProducts(products, filters), [products, filters]);

  const title = categoryLabels[category] || "Shop";

  return (
    <div className="page-shell">
      <Navbar />
      <header className="category-hero">
        <p className="hero-tag">Shop by category</p>
        <h1>{title}</h1>
        <p>Curated {title.toLowerCase()} styles for the season.</p>
        <div className="category-tiles">
          {CATEGORIES.map((c) => (
            <Link
              key={c.value}
              to={c.path}
              className={`category-tile ${c.value === category ? "active" : ""}`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </header>

      <div className="catalog-layout">
        <FilterSidebar filters={filters} onChange={setFilters} />
        <section className="products-section catalog-main">
          <div className="section-head">
            <h2>{title} collection</h2>
            <p>{isLoading ? "Loading styles..." : `${safeProducts(viewProducts).length} items`}</p>
          </div>
          <div className="products-grid">
            {viewProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {!isLoading && viewProducts.length === 0 && (
            <p className="auth-subtitle">No items match your filters.</p>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default CategoryPage;

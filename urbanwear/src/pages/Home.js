import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { CATEGORIES, fetchProducts, safeProducts, shuffleProducts } from "../services/productService";

function Home() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const loaded = await fetchProducts();
      setProducts(loaded);
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  const all = safeProducts(products);
  const featured = shuffleProducts(all).slice(0, 4);
  const newArrivals = [...all].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 4);
  const trending = shuffleProducts(all).slice(0, 4);

  return (
    <div className="page-shell">
      <Navbar />

      <section className="fashion-hero">
        <div className="fashion-hero-content">
          <p className="hero-tag">Spring / Summer 2026</p>
          <h1>Define your urban style</h1>
          <p>Minimal silhouettes, premium fabrics, and outfits built for the city.</p>
          <div className="hero-actions">
            <Link to="/category/hoodie" className="hero-cta">
              Shop hoodies
            </Link>
            <Link to="/category/all" className="hero-cta secondary">
              Shop all
            </Link>
          </div>
        </div>
      </section>

      <section className="category-strip">
        <h2>Shop by category</h2>
        <div className="category-tiles">
          {CATEGORIES.map((c) => (
            <Link key={c.value} to={c.path} className="category-tile">
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      <ProductRow title="Featured" subtitle="Editor picks" products={featured} isLoading={isLoading} />
      <ProductRow title="New arrivals" subtitle="Just dropped" products={newArrivals} isLoading={isLoading} />
      <ProductRow title="Trending outfits" subtitle="Most loved this week" products={trending} isLoading={isLoading} />

      <Footer />
    </div>
  );
}

function ProductRow({ title, subtitle, products, isLoading }) {
  return (
    <section className="products-section">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          <p>{isLoading ? "Loading..." : subtitle}</p>
        </div>
      </div>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={`${title}-${product.id}`} product={product} />
        ))}
      </div>
    </section>
  );
}

export default Home;

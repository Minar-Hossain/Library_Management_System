import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import {
  CLOTHING_SIZES,
  fetchProductById,
  getColorsForProduct,
  getSizesForProduct,
} from "../services/productService";

function ProductDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [message, setMessage] = useState("");
  const [product, setProduct] = useState(location.state?.product || null);
  const [isLoading, setIsLoading] = useState(!location.state?.product);

  useEffect(() => {
    if (location.state?.product?.type === "clothing") {
      setProduct(location.state.product);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setIsLoading(true);
      const loaded = await fetchProductById(id);
      if (!cancelled) {
        setProduct(loaded);
        setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, location.state]);

  const sizes = useMemo(() => getSizesForProduct(product), [product]);
  const colors = useMemo(() => getColorsForProduct(product), [product]);
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("Black");

  useEffect(() => {
    if (!product) return;
    const nextSizes = sizes.length ? sizes : CLOTHING_SIZES;
    const nextColors = colors.length ? colors : ["Black"];
    setSize(nextSizes.includes("M") ? "M" : nextSizes[0]);
    setColor(nextColors[0]);
  }, [product, sizes, colors]);

  if (isLoading) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="details-layout">
          <p className="auth-subtitle">Loading product...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="details-layout">
          <section className="details-card">
            <h1>Product not found</h1>
            <p className="auth-subtitle">The selected item does not exist.</p>
            <Link to="/home">Return to Home</Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, { size, color });
    setMessage("Added to cart.");
  };

  return (
    <div className="page-shell">
      <Navbar />
      <main className="details-layout">
        <section className="details-card">
          <img src={product.image} alt={product.name} className="details-image" />
          <div className="details-info">
            <p className="product-category">
              {product.category} · {product.subcategory}
            </p>
            <h1>{product.name}</h1>
            <p className="details-price">${product.price}</p>
            <p>{product.description}</p>
            <p className="product-meta">
              <strong>Material:</strong> {product.material} · <strong>Fit:</strong> {product.fitType}
            </p>

            <div className="selectors">
              <label htmlFor="size">Size</label>
              <select id="size" value={size} onChange={(e) => setSize(e.target.value)}>
                {(sizes.length ? sizes : CLOTHING_SIZES).map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>

              <label htmlFor="color">Color</label>
              <select id="color" value={color} onChange={(e) => setColor(e.target.value)}>
                {colors.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="details-actions">
              <button type="button" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button type="button" className="secondary-btn" onClick={() => navigate("/cart")}>
                Go to Cart
              </button>
            </div>
            {message && <p className="feedback success">{message}</p>}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default ProductDetails;

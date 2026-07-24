import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { getProductById } from "../services/productService";

const sizes = ["S", "M", "L", "XL"];
const colors = ["Black", "Navy", "Olive", "Sand"];

function ProductDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("Black");
  const [message, setMessage] = useState("");

  const product = useMemo(() => {
    const candidate = location.state?.product;
    if (
      candidate?.type === "shoes" &&
      typeof candidate?.image === "string" &&
      candidate.image.includes("/assets/products/shoes/")
    ) {
      return candidate;
    }

    return getProductById(id);
  }, [id, location.state]);

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
            <p className="product-category">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="details-price">${product.price}</p>
            <p>{product.description}</p>

            <div className="selectors">
              <label htmlFor="size">Size</label>
              <select id="size" value={size} onChange={(event) => setSize(event.target.value)}>
                {sizes.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>

              <label htmlFor="color">Color</label>
              <select id="color" value={color} onChange={(event) => setColor(event.target.value)}>
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

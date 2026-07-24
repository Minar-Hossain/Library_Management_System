import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

function Cart() {
  const { cartItems, totalPrice, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();

  return (
    <div className="page-shell">
      <Navbar />
      <main className="cart-layout">
        <section className="cart-panel">
          <h1>Your Cart</h1>

          {cartItems.length === 0 ? (
            <p className="auth-subtitle">
              Your cart is empty. <Link to="/home">Explore products</Link>
            </p>
          ) : (
            <>
              <div className="cart-list">
                {cartItems.map((item) => (
                  <article className="cart-item" key={item.key}>
                    <img src={item.image} alt={item.name} />
                    <div className="cart-item-info">
                      <h3>{item.name}</h3>
                      <p>
                        Size: {item.size} | Color: {item.color}
                      </p>
                      <p>${item.price}</p>
                    </div>
                    <div className="cart-controls">
                      <button type="button" onClick={() => decreaseQuantity(item.key)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => increaseQuantity(item.key)}>
                        +
                      </button>
                      <button type="button" className="remove-btn" onClick={() => removeFromCart(item.key)}>
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="cart-summary">
                <h2>Total: ${totalPrice.toFixed(2)}</h2>
                <Link to="/checkout" className="checkout-link">
                  Proceed to Checkout
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Cart;

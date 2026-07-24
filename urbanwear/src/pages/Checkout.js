import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/orderService";

const initialForm = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
};

function Checkout() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartItems, totalPrice, clearCart } = useCart();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCartEmpty = useMemo(() => cartItems.length === 0, [cartItems.length]);

  const validate = () => {
    if (!formData.fullName.trim()) {
      return "Full Name is required.";
    }
    if (!formData.phone.trim()) {
      return "Phone Number is required.";
    }
    if (!formData.address.trim()) {
      return "Address is required.";
    }
    if (!formData.city.trim()) {
      return "City is required.";
    }
    return "";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (isCartEmpty) {
      setError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      const shippingAddress = `${formData.address.trim()}, ${formData.city.trim()}`;
      const orderId = await createOrder({
        items: cartItems,
        totalAmount: totalPrice,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phone.trim(),
        shippingAddress,
      });

      clearCart();
      navigate("/success", { state: { orderId } });
    } catch (checkoutError) {
      setError("Unable to place order right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <main className="checkout-layout">
        <section className="checkout-panel">
          <h1>Checkout</h1>
          <p className="auth-subtitle">Enter your delivery details to complete the order.</p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="fullName">Full Name</label>
            <input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />

            <label htmlFor="phone">Phone Number</label>
            <input id="phone" name="phone" value={formData.phone} onChange={handleChange} />

            <label htmlFor="address">Address</label>
            <input id="address" name="address" value={formData.address} onChange={handleChange} />

            <label htmlFor="city">City</label>
            <input id="city" name="city" value={formData.city} onChange={handleChange} />

            {error && <p className="feedback error">{error}</p>}

            <button type="submit" disabled={isSubmitting || isCartEmpty}>
              {isSubmitting ? "Placing order..." : "Place Order"}
            </button>
          </form>
        </section>

        <section className="checkout-summary">
          <h2>Order Summary</h2>
          {cartItems.map((item) => (
            <div className="checkout-item" key={item.key}>
              <p>{item.name}</p>
              <p>
                {item.quantity} x ${item.price}
              </p>
            </div>
          ))}
          <div className="checkout-total">
            <strong>Total: ${totalPrice.toFixed(2)}</strong>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Checkout;

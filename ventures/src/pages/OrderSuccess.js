import { Link, useLocation } from "react-router-dom";

function OrderSuccess() {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <main className="auth-layout">
      <section className="auth-card success-card">
        <h1>Order Placed Successfully</h1>
        <p className="auth-subtitle">
          Thank you for shopping with VENTURES. Your order is confirmed and being prepared.
        </p>
        {orderId && <p className="feedback success">Order ID: {orderId}</p>}
        <Link to="/home" className="back-home-link">
          Continue Shopping
        </Link>
      </section>
    </main>
  );
}

export default OrderSuccess;

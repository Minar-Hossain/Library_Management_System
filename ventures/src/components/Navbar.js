import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { itemCount } = useCart();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="brand-mark">
        <Link to="/home" className="brand-link">
          <img
            src="/assets/ventures-logo.png"
            alt="VENTURES logo"
            className="brand-logo"
            onError={(event) => {
              event.currentTarget.src = "/assets/ventures-logo.svg";
            }}
          />
          <span>VENTURES</span>
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/cart" className="cart-link">
          Cart <span className="cart-badge">{itemCount}</span>
        </Link>
        <span className="user-pill">{currentUser?.displayName || currentUser?.email}</span>
        <button type="button" className="nav-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

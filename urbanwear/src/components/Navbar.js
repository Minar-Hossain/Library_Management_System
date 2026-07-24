import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getDisplayName } from "../services/userService";
import { CATEGORIES } from "../services/productService";

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
            src="/assets/logo.png"
            alt="URBANWEAR logo"
            className="brand-logo"
            onError={(event) => {
              event.currentTarget.src = "/assets/logo.svg";
            }}
          />
          <span>URBANWEAR</span>
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/home">Home</Link>
        {CATEGORIES.map((c) => (
          <Link key={c.value} to={c.path}>
            {c.label}
          </Link>
        ))}
        <Link to="/cart" className="cart-link">
          Cart <span className="cart-badge">{itemCount}</span>
        </Link>
        <Link to="/profile" className="user-pill">
          {getDisplayName(currentUser) || "Profile"}
        </Link>
        <button type="button" className="nav-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

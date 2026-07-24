import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";

const initialForm = { email: "", password: "" };

function Login() {
  const { currentUser, isAuthLoading, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectPath = location.state?.from?.pathname || "/home";

  if (!isAuthLoading && currentUser) {
    return <Navigate to={redirectPath} replace />;
  }

  const validate = () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      return "Email and password are required.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters.";
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
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });
      setCurrentUser(user);
      setSuccess("Login successful. Welcome to URBANWEAR.");
      navigate(redirectPath, { replace: true });
    } catch (authError) {
      setError(authError.message || "Unable to login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-card">
        <h1>URBANWEAR Login</h1>
        <p className="auth-subtitle">Sign in to manage your shopping experience.</p>

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />

          {error && <p className="feedback error">{error}</p>}
          {success && <p className="feedback success">{success}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="switch-link">
          New to URBANWEAR? <Link to="/signup">Create Account</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;

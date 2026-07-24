import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { fetchMyOrders } from "../services/orderService";
import { fetchProfile, getDisplayName, updateProfile } from "../services/userService";

function Profile() {
  const { currentUser, setCurrentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ firstName: "", lastName: "", phoneNumber: "", location: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [user, orderList] = await Promise.all([fetchProfile(), fetchMyOrders()]);
        setProfile(user);
        setOrders(orderList);
        setForm({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phoneNumber: user.phoneNumber || "",
          location: user.location || "",
        });
      } catch (err) {
        setError("Unable to load profile.");
      }
    }
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);
    try {
      await updateProfile(form);
      const updated = { ...currentUser, ...form };
      setCurrentUser(updated);
      setProfile((p) => ({ ...p, ...form }));
      setMessage("Profile updated.");
    } catch (err) {
      setError(err.message || "Update failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = getDisplayName(profile || currentUser);

  return (
    <div className="page-shell">
      <Navbar />
      <main className="profile-layout">
        <section className="profile-card">
          <h1>My Profile</h1>
          <p className="auth-subtitle">{displayName}</p>
          <p className="profile-email">{profile?.email || currentUser?.email}</p>

          <form onSubmit={handleSave}>
            <label htmlFor="firstName">First name</label>
            <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} />

            <label htmlFor="lastName">Last name</label>
            <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} />

            <label htmlFor="phoneNumber">Phone</label>
            <input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />

            <label htmlFor="location">Location</label>
            <input id="location" name="location" value={form.location} onChange={handleChange} />

            {error && <p className="feedback error">{error}</p>}
            {message && <p className="feedback success">{message}</p>}

            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </section>

        <section className="profile-orders">
          <h2>Recent orders</h2>
          {orders.length === 0 ? (
            <p className="auth-subtitle">No orders yet.</p>
          ) : (
            <ul className="order-list">
              {orders.map((order) => (
                <li key={order.orderId} className="order-list-item">
                  <strong>{order.orderId}</strong>
                  <span>${Number(order.totalAmount || 0).toFixed(2)}</span>
                  <span className="order-status">{order.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;

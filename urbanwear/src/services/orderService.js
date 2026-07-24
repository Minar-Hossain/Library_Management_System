import { getAuthToken } from "./authService";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function createOrder({ items, totalAmount, fullName, phoneNumber, shippingAddress }) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fullName,
      phoneNumber,
      shippingAddress,
      totalAmount,
      status: "pending",
      items: items.map((item) => ({
        productId: String(item.productId),
        productName: item.name,
        size: item.size || null,
        color: item.color || null,
        quantity: item.quantity || 1,
        priceSnapshot: item.price || 0,
      })),
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Unable to place order");
  }

  return payload.orderId;
}

export async function fetchMyOrders() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Unable to load orders");
  }

  return payload.orders || [];
}

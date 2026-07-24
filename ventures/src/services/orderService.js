import { getAuthToken } from "./authService";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function createOrder({ userId, items, totalPrice, customer }) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId,
      items,
      totalPrice,
      customer,
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
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Unable to load orders");
  }

  return payload.orders || [];
}

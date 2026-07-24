import { getAuthToken, getStoredSession } from "./authService";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export function getDisplayName(user) {
  if (!user) return "";
  const first = user.firstName || "";
  const last = user.lastName || "";
  const full = `${first} ${last}`.trim();
  return full || user.email || "";
}

export async function fetchProfile() {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Unable to load profile");
  }
  return payload.user;
}

export async function updateProfile(updates) {
  const session = getStoredSession();
  const userId = session?.user?.userId;
  if (!userId) throw new Error("Not signed in");

  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || "Unable to update profile");
  }

  return payload;
}

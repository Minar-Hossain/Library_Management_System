const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const SESSION_STORAGE_KEY = "ventures_session";

function normalizeErrorMessage(error, fallbackMessage) {
  return error?.message || fallbackMessage;
}

async function parseApiResponse(response) {
  let payload = {};
  try {
    payload = await response.json();
  } catch (error) {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
}

function saveSession(session) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function signupUser({ email, password, name, phone }) {
  try {
    const nameParts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const firstName = nameParts[0] || "User";
    const lastName = nameParts.slice(1).join(" ") || "Account";

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        phoneNumber: phone || "",
      }),
    });

    const payload = await parseApiResponse(response);
    saveSession({ token: payload.token, user: payload.user });
    return payload.user;
  } catch (error) {
    throw new Error(normalizeErrorMessage(error, "Unable to create account."));
  }
}

export async function loginUser({ email, password }) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const payload = await parseApiResponse(response);
    saveSession({ token: payload.token, user: payload.user });
    return payload.user;
  } catch (error) {
    throw new Error(normalizeErrorMessage(error, "Unable to login."));
  }
}

export async function fetchCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await parseApiResponse(response);
  return payload.user;
}

export function getAuthToken() {
  return getStoredSession()?.token || "";
}

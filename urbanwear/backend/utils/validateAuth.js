const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function parseName(payload) {
  const nameParts = String(payload.name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const firstName = String(payload.firstName || nameParts[0] || "").trim();
  const lastName = String(payload.lastName || nameParts.slice(1).join(" ") || "").trim();

  return { firstName, lastName };
}

function validateRegisterInput(payload) {
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "");
  const { firstName, lastName } = parseName(payload);
  const phoneNumber = payload.phoneNumber ? String(payload.phoneNumber).trim() : null;
  const location = payload.location ? String(payload.location).trim() : null;
  const role = String(payload.role || "customer").trim().toLowerCase();

  if (!email || !password || !firstName || !lastName) {
    return {
      ok: false,
      status: 400,
      message: "email, password, firstName, and lastName are required",
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, status: 400, message: "Invalid email format" };
  }

  if (password.length < 6) {
    return { ok: false, status: 400, message: "Password must be at least 6 characters" };
  }

  if (password.length > 128) {
    return { ok: false, status: 400, message: "Password must be at most 128 characters" };
  }

  const allowedRoles = ["customer", "admin"];
  if (!allowedRoles.includes(role)) {
    return { ok: false, status: 400, message: "role must be customer or admin" };
  }

  return {
    ok: true,
    data: { email, password, firstName, lastName, phoneNumber, location, role },
  };
}

module.exports = {
  normalizeEmail,
  validateRegisterInput,
};

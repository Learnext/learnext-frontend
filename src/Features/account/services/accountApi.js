const rawApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = rawApiUrl
  ? rawApiUrl.endsWith("/api/v1")
    ? rawApiUrl
    : `${rawApiUrl}/api/v1`
  : "";

const unwrap = (payload) => {
  if (payload && typeof payload === "object" && "success" in payload) {
    return payload.data;
  }

  return payload;
};

const getToken = () => localStorage.getItem("auth-token");

export const requestApi = async (path, options = {}) => {
  if (!API_BASE) {
    throw new Error("API URL is not configured");
  }

  const token = getToken();
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  const payload = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || "Request failed");
  }

  return unwrap(payload);
};

export const requireLogin = () => {
  if (!getToken()) {
    throw new Error("LOGIN_REQUIRED");
  }
};

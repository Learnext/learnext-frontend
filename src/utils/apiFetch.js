const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL = rawApiUrl
  ? rawApiUrl.endsWith("/api/v1")
    ? rawApiUrl
    : `${rawApiUrl}/api/v1`
  : "http://localhost:1201/api/v1";

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
};

const tryRefreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) throw new Error("Refresh failed");

  const json = await res.json();
  const newToken = json.accessToken || json.data?.accessToken;
  if (!newToken) throw new Error("No access token in refresh response");

  localStorage.setItem("auth-token", newToken);
  return newToken;
};

/**
 * Drop-in replacement for fetch() that automatically:
 * - Adds Authorization: Bearer <token> if a token exists
 * - On 401, silently refreshes the access token and retries once
 * - On refresh failure, clears storage and redirects to /login
 */
const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("auth-token");

  const buildHeaders = (accessToken) => ({
    ...(options.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  });

  let res = await fetch(url, { ...options, headers: buildHeaders(token) });

  if (res.status !== 401) return res;

  // Avoid retrying the refresh endpoint itself to prevent loops
  if (url.includes("/auth/refresh") || url.includes("/auth/login")) return res;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshQueue.push({
        resolve: (newToken) =>
          fetch(url, { ...options, headers: buildHeaders(newToken) }).then(resolve),
        reject,
      });
    });
  }

  isRefreshing = true;
  try {
    const newToken = await tryRefreshToken();
    processQueue(null, newToken);
    res = await fetch(url, { ...options, headers: buildHeaders(newToken) });
  } catch (err) {
    processQueue(err);
    localStorage.removeItem("auth-token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("instructorId");
    window.location.href = "/login";
    throw err;
  } finally {
    isRefreshing = false;
  }

  return res;
};

export default apiFetch;

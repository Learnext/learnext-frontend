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

export const createOrder = async (courseId) => {
  if (!API_BASE) {
    return {
      id: Date.now(),
      courseId,
      status: "PENDING_PAYMENT",
    };
  }

  const token = localStorage.getItem("auth-token");
  if (!token) {
    throw new Error("LOGIN_REQUIRED");
  }

  const response = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ courseId }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || "ORDER_FAILED");
  }

  return unwrap(payload);
};

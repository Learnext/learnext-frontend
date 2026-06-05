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

export const createSupportLead = async (data) => {
  if (!API_BASE) {
    return {
      id: `local-${Date.now()}`,
      ...data,
      status: "NEW",
      createdAt: new Date().toISOString(),
    };
  }

  const response = await fetch(`${API_BASE}/support/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || "Unable to send support request");
  }

  return unwrap(payload);
};

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL = rawApiUrl
  ? rawApiUrl.endsWith("/api/v1")
    ? rawApiUrl
    : `${rawApiUrl}/api/v1`
  : "";

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

const unwrap = (payload) => {
  if (payload && typeof payload === "object" && "success" in payload) {
    return payload.data;
  }

  return payload;
};

export const updateProfile = async (formData, authUser) => {
  const requestBody = {
    fullName: formData.fullName || formData.username || authUser?.fullName || authUser?.username,
    phone: formData.phone || "",
    bio: formData.bio || "",
  };

  if (!API_URL) {
    await delay();

    return {
      success: true,
      user: {
        ...authUser,
        ...formData,
      },
    };
  }

  const response = await fetch(`${API_URL}/profile/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
    },
    body: JSON.stringify(requestBody),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || "Update failed");
  }

  return {
    success: true,
    user: {
      ...authUser,
      ...unwrap(payload),
      username: unwrap(payload)?.fullName || authUser?.username,
    },
  };
};

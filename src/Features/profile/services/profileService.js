const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL = rawApiUrl
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

export const fetchProfile = async () => {
  const token = localStorage.getItem("auth-token");
  if (!token || !API_URL) return null;

  const res = await fetch(`${API_URL}/profile/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.message || "Load profile failed");

  return unwrap(payload);
};

export const updateProfile = async (formData, authUser) => {
  // Chuẩn bị payload gửi lên BE (Đã thêm expertise và bỏ username)
  const requestBody = {
    fullName: formData.fullName,
    phone: formData.phone,
    bio: formData.bio,
  };

  if (!API_URL) {
    return { success: true, user: { ...authUser, ...formData } };
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
    throw new Error(
      payload?.error?.message || payload?.message || "Update failed",
    );
  }

  // Cập nhật lại Auth Context
  return {
    success: true,
    user: {
      ...authUser,
      ...unwrap(payload),
      fullName: unwrap(payload)?.fullName || authUser?.fullName, // Trả về fullName chuẩn
    },
  };
};

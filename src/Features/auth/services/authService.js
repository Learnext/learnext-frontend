import { INSTRUCTORS } from "../../../config/instructors";
const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL = rawApiUrl
  ? rawApiUrl.endsWith("/api/v1")
    ? rawApiUrl
    : `${rawApiUrl}/api/v1`
  : "http://localhost:1201/api/v1";

const request = async (url, options = {}) => {
  const response = await fetch(url, options);

  const data = await response.json();

  if (!response.ok) {
    console.log("API ERROR:", data);

    throw new Error(
      data.message || data.error?.message || JSON.stringify(data),
    );
  }

  return data;
};

export const loginService = async (email, password) => {
  const response = await request(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const tokenData = response.data || response;

  const { accessToken, refreshToken } = tokenData;

  localStorage.setItem("auth-token", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  const profileRes = await fetch(`${API_URL}/profile/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const profileJson = await profileRes.json();

  const profile = profileJson.data || profileJson;

  const payload = JSON.parse(atob(accessToken.split(".")[1]));

  const user = {
    ...profile,
    id: payload.sub || payload.userId || payload.id,
  };
  const instructorId = INSTRUCTORS[user.email];

  if (instructorId) {
    localStorage.setItem("instructorId", instructorId);
  } else {
    localStorage.removeItem("instructorId");
  }
  return {
    success: true,
    token: accessToken,
    user,
  };
};

export const signupService = async (formData) => {
  await request(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: formData.email,
      password: formData.password,
      fullName: formData.username || formData.fullName || "",
    }),
  });

  // Sau khi đăng ký, tự động login luôn
  return await loginService(formData.email, formData.password);
};

export const logoutService = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (refreshToken) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Bỏ qua lỗi logout
    }
  }

  localStorage.removeItem("auth-token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

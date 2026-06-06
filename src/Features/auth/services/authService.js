const rawApiUrl = import.meta.env.VITE_API_URL;
const API_URL = rawApiUrl
  ? rawApiUrl.endsWith("/api/v1")
    ? rawApiUrl
    : `${rawApiUrl}/api/v1`
  : "";

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || "Request failed");
  }

  return data;
};

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return {};
  }
};

const buildUserFromToken = (token, fallback = {}) => {
  const claims = decodeJwtPayload(token);

  return {
    id: claims.sub || fallback.id,
    email: claims.email || fallback.email,
    fullName: fallback.fullName || fallback.name || claims.email || fallback.email,
    role: fallback.role || "user",
  };
};

export const loginService = async (email, password) => {
  try {
    const data = await request(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (data.refreshToken) {
      localStorage.setItem("refresh-token", data.refreshToken);
    }

    return {
      success: true,
      token: data.accessToken,
      refreshToken: data.refreshToken,
      user: buildUserFromToken(data.accessToken, { email }),
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Invalid email or password",
    };
  }
};

export const signupService = async (formData) => {
  try {
    const registeredUser = await request(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName || formData.username,
      }),
    });

    const loginResult = await loginService(formData.email, formData.password);

    if (!loginResult.success) {
      return loginResult;
    }

    return {
      ...loginResult,
      user: {
        ...loginResult.user,
        id: loginResult.user.id || registeredUser.id,
        fullName: registeredUser.name || loginResult.user.fullName,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Sign up failed",
    };
  }
};

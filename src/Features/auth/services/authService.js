const API_URL = import.meta.env.VITE_API_URL;

export const loginService = async (email, password) => {
  if (!API_URL) {
    await new Promise((res) => setTimeout(res, 800));

    return {
      success: true,
      token: "fake-token",
      user: {
        username: "Demo User",
        email,
        role: "instructor",
      },
    };
  }

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return response.json();
};

export const signupService = async (formData) => {
  if (!API_URL) {
    await new Promise((res) => setTimeout(res, 800));

    return {
      success: true,
      token: "fake-token",
      user: {
        username: formData.username,
        email: formData.email,
        role: "user",
      },
    };
  }

  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  return response.json();
};

const API_URL = import.meta.env.VITE_API_URL;

const request = async (url, options = {}) => {
  const response = await fetch(url, options);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const loginService = async (email, password) => {
  const users = await request(`${API_URL}/users`);

  const user = users.find(
    (u) =>
      u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
      u.password === password,
  );

  if (!user) {
    return {
      success: false,
      message: "Sai email hoặc mật khẩu",
    };
  }

  return {
    success: true,
    token: "fake-jwt-token",
    user,
  };
};

export const signupService = async (formData) => {
  const users = await request(`${API_URL}/users`);

  const exists = users.find(
    (u) => u.email.trim().toLowerCase() === formData.email.trim().toLowerCase(),
  );

  if (exists) {
    return {
      success: false,
      message: "Email đã tồn tại",
    };
  }

  const newUser = {
    username: formData.username,
    email: formData.email,
    password: formData.password,
    role: "user",
  };

  const createdUser = await request(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newUser),
  });

  return {
    success: true,
    token: "fake-jwt-token",
    user: createdUser,
  };
};

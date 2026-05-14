const API_URL = import.meta.env.VITE_API_URL;

export const loginService = async (email, password) => {
  console.log("LOGIN:", email, password);

  const response = await fetch(`${API_URL}/users`);

  const users = await response.json();

  console.log("DB USERS:", users);

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
    token: "fake-token",
    user,
  };
};

export const signupService = async (formData) => {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...formData,
      role: "user",
      isInstructor: false,
    }),
  });

  const user = await response.json();

  return {
    success: true,
    token: "fake-token",
    user,
  };
};

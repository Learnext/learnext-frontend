const API_URL = import.meta.env.VITE_API_URL;

export const updateProfile = async (formData, authUser) => {
  if (!API_URL) {
    await new Promise((res) => setTimeout(res, 800));
    return {
      success: true,
      user: { ...authUser, ...formData },
    };
  }

  const response = await fetch(`${API_URL}/user/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
    },
    body: JSON.stringify(formData),
  });

  return response.json();
};

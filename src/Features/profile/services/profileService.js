const API_URL = import.meta.env.VITE_API_URL;

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

export const updateProfile = async (formData, authUser) => {
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

  const response = await fetch(`${API_URL}/users/${authUser.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
    },
    body: JSON.stringify({
      ...authUser,
      ...formData,
    }),
  });

  if (!response.ok) {
    throw new Error("Update failed");
  }

  const user = await response.json();

  return {
    success: true,
    user,
  };
};

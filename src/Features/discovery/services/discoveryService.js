export const API_URL = import.meta.env.VITE_API_URL;

export const fetchDiscoveryCourses = async () => {
  const res = await fetch(`${API_URL}/courses`);
  if (!res.ok) throw new Error("Fetch courses failed");
  return res.json();
};

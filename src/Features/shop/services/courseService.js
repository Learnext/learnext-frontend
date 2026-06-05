import allProduct from "../../../Assets/Frontend_Assets/all_product";

const rawApiUrl = import.meta.env.VITE_API_URL;
const API_BASE = rawApiUrl
  ? rawApiUrl.endsWith("/api/v1")
    ? rawApiUrl
    : `${rawApiUrl}/api/v1`
  : "";

const localImages = allProduct.map((item) => item.image);

const fallbackCourses = allProduct.slice(0, 8).map((item, index) => ({
  id: String(item.id),
  title: item.name,
  description: "Course preview content is available while the backend API is offline.",
  price: item.new_price,
  thumbnailUrl: item.image,
  hasPreview: index % 2 === 0,
  rating: 4.5,
  categoryName: item.category,
  instructorName: "Learnext Instructor",
  createdAt: new Date(Date.now() - index * 86400000).toISOString(),
}));

const unwrap = (payload) => {
  if (payload && typeof payload === "object" && "success" in payload) {
    return payload.data;
  }

  return payload;
};

const withLocalImage = (course, index = 0) => ({
  ...course,
  image: course.thumbnailUrl || localImages[index % localImages.length],
  name: course.title,
  new_price: Number(course.price || 0),
  old_price: null,
});

const request = async (path) => {
  if (!API_BASE) {
    throw new Error("API URL is not configured");
  }

  const response = await fetch(`${API_BASE}${path}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.message || "Request failed");
  }

  return unwrap(payload);
};

export const fetchPublicCourses = async (params = {}) => {
  try {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });

    const courses = await request(`/courses${query.toString() ? `?${query}` : ""}`);
    return courses.map(withLocalImage);
  } catch {
    return fallbackCourses.map(withLocalImage);
  }
};

export const fetchPublicCourse = async (id) => {
  try {
    const course = await request(`/courses/${id}`);
    return withLocalImage(course);
  } catch {
    const course = fallbackCourses.find((item) => String(item.id) === String(id));
    return course ? withLocalImage(course) : null;
  }
};

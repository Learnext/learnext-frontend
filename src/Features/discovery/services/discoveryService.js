const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1201/api/v1";

// 1. Lấy tất cả khóa học (Có thể dùng cho NewCollections / Popular)
export const fetchDiscoveryCourses = async () => {
  const res = await fetch(`${API_URL}/courses`);

  if (!res.ok) {
    throw new Error("Fetch courses failed");
  }

  const result = await res.json();
  return result.data ?? [];
};

// 2. Tìm kiếm và lọc khóa học (Dùng riêng cho trang Discovery / Search)
export const searchCoursesService = async (searchKeyword, searchCategoryId) => {
  const query = new URLSearchParams();

  if (searchKeyword.trim()) {
    query.append("q", searchKeyword.trim());
  }
  if (searchCategoryId !== "all") {
    query.append("categoryId", searchCategoryId);
  }

  const res = await fetch(`${API_URL}/courses/search?${query.toString()}`);

  if (!res.ok) {
    throw new Error("Search courses failed");
  }

  const json = await res.json();
  return json.data || [];
};

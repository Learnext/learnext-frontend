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
// discoveryService.js
export const searchCoursesService = async (searchKeyword, searchCategoryId) => {
  const query = new URLSearchParams();

  if (searchKeyword.trim()) {
    query.append("q", searchKeyword.trim()); // /courses cũng hỗ trợ q
  }
  if (searchCategoryId !== "all") {
    query.append("categoryId", searchCategoryId);
  }

  // Dùng /courses thay vì /courses/search
  const url = `${API_URL}/courses?${query.toString()}`;
  console.log("=== SEARCH URL:", url);

  const res = await fetch(url);
  const json = await res.json();

  console.log("=== SEARCH RESPONSE:", json);

  if (!res.ok) throw new Error("Search courses failed");

  return json.data || [];
};

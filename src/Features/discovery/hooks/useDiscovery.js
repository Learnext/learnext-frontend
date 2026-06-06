import { useState, useEffect, useCallback } from "react";
import debounce from "lodash/debounce";
import { searchCoursesService } from "../services/discoveryService";

export const useDiscovery = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("all");

  // Hàm trung gian quản lý loading và gọi Service
  const fetchCourses = async (searchKeyword, searchCategoryId) => {
    setLoading(true);
    try {
      const data = await searchCoursesService(searchKeyword, searchCategoryId);
      setCourses(data);
    } catch (err) {
      console.error("Lỗi fetch search:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce API call để tránh spam server khi gõ phím liên tục
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(
    debounce((k, c) => fetchCourses(k, c), 500),
    [],
  );

  // Lắng nghe sự thay đổi của keyword và categoryId để kích hoạt tìm kiếm
  useEffect(() => {
    debouncedFetch(keyword, categoryId);
  }, [keyword, categoryId, debouncedFetch]);

  return { courses, loading, keyword, setKeyword, categoryId, setCategoryId };
};

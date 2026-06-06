import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCourses } from "../Features/discovery/hooks/useCourses";
import "./CSS/SearchPage.css";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get("q") || "";

  const { courses, loading } = useCourses(); // ← dùng chung

  const results = useMemo(() => {
    if (!keyword.trim()) return [];
    return courses.filter(
      (c) =>
        c.title?.toLowerCase().includes(keyword.toLowerCase()) ||
        c.description?.toLowerCase().includes(keyword.toLowerCase()) ||
        c.category?.toLowerCase().includes(keyword.toLowerCase()),
    );
  }, [courses, keyword]);

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="search-page">
      <h1 className="search-title">Kết quả tìm kiếm: "{keyword}"</h1>
      <p className="search-count">Tìm thấy {results.length} khóa học</p>

      <div className="search-grid">
        {results.map((course) => (
          <div
            key={course.id}
            className="search-card"
            onClick={() => navigate(`/course/${course.id}`)}
          >
            <img src={course.thumbnail} alt={course.title} />
            <div className="search-body">
              <div className="search-category">{course.category}</div>
              <div className="search-name">{course.title}</div>
              <div className="search-desc">{course.description}</div>
              <div className="search-price">
                {Number(course.price || 0).toLocaleString("vi-VN")}đ
              </div>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="search-empty">Không tìm thấy khóa học phù hợp</div>
      )}
    </div>
  );
};

export default SearchPage;

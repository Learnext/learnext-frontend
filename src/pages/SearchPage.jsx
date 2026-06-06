import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./CSS/SearchPage.css";

const API = "http://localhost:1201/api/v1";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const keyword = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        // Sử dụng API search chuẩn của Learnext
        const query = new URLSearchParams();
        if (keyword.trim()) {
          query.append("q", keyword.trim());
        }
        // Có thể thêm phân trang mặc định
        query.append("page", "1");
        query.append("pageSize", "12");

        const res = await fetch(`${API}/courses/search?${query.toString()}`);
        const json = await res.json();

        if (json.success) {
          setResults(json.data || []);
          setPagination(json.pagination);
        }
      } catch (err) {
        console.error("Lỗi tìm kiếm khóa học:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [keyword]); // Chạy lại API mỗi khi keyword trên URL thay đổi

  if (loading) {
    return (
      <div className="search-page">
        <p>Đang tải kết quả tìm kiếm...</p>
      </div>
    );
  }

  return (
    <div className="search-page">
      <h1 className="search-title">Kết quả tìm kiếm: "{keyword}"</h1>
      <p className="search-count">
        Tìm thấy {pagination?.totalItems ?? results.length} khóa học
      </p>

      {results.length === 0 ? (
        <div className="search-empty">Không tìm thấy khóa học phù hợp</div>
      ) : (
        <div className="search-grid">
          {results.map((course) => (
            <div
              key={course.id}
              className="search-card"
              onClick={() => navigate(`/course/${course.id}`)}
            >
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.src =
                    "https://placehold.co/400x225/4f46e5/white?text=No+Image";
                }}
              />
              <div className="search-body">
                {/* Dùng chuẩn tên field từ CourseListItemResponse DTO */}
                <div className="search-category">{course.categoryName}</div>
                <div className="search-name">{course.title}</div>

                {/* Thêm tên giảng viên vì API có trả về */}
                <div
                  className="search-instructor"
                  style={{ fontSize: "0.9rem", color: "#666" }}
                >
                  Giảng viên: {course.instructorName}
                </div>

                <div className="search-price">
                  {Number(course.price || 0).toLocaleString("vi-VN")}đ
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;

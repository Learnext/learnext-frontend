import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Features/auth/context/AuthContext";
import "./CSS/MyCourses.css";

const API = "http://localhost:1201/api/v1";

const MyCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadMyCourses = async () => {
      try {
        const token = localStorage.getItem("auth-token");

        const res = await fetch(`${API}/learning/enrollments`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (json.success) {
          setCourses(json.data || []);
        }
      } catch (err) {
        console.error("LỖI loadMyCourses:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMyCourses();
  }, [user]);

  if (loading) {
    return (
      <div className="my-courses-page">
        <div className="my-courses-loading">
          <div className="loading-spinner" />
          <p>Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="my-courses-page">
        <div className="my-courses-empty">
          <div className="empty-icon">🔒</div>
          <h2>Bạn chưa đăng nhập</h2>
          <p>Vui lòng đăng nhập để xem khóa học của bạn</p>
          <button onClick={() => navigate("/login")}>Đăng nhập</button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-courses-page">
      <div className="my-courses-header">
        <h1>Khóa học của tôi</h1>
        <span className="course-count">{courses.length} khóa học</span>
      </div>

      {courses.length === 0 ? (
        <div className="my-courses-empty">
          <div className="empty-icon">📚</div>
          <h2>Bạn chưa có khóa học nào</h2>
          <p>Hãy khám phá và mua khóa học để bắt đầu học ngay!</p>
          <button onClick={() => navigate("/")}>Khám phá khóa học</button>
        </div>
      ) : (
        <div className="my-courses-grid">
          {courses.map((enrollment) => (
            <div className="my-course-card" key={enrollment.id}>
              <div className="my-course-thumbnail">
                <img
                  // BE chưa trả về thumbnailUrl → dùng placeholder
                  src="https://placehold.co/400x225/4f46e5/white?text=No+Image"
                  alt={enrollment.courseTitle}
                />
              </div>

              <div className="my-course-body">
                <h3>{enrollment.courseTitle}</h3>

                {/* BE chưa trả về progress — ẩn thanh tiến trình */}

                <p
                  className="enroll-date"
                  style={{
                    fontSize: "0.85rem",
                    color: "#6b7280",
                    marginBottom: "12px",
                  }}
                >
                  Đã đăng ký:{" "}
                  {new Date(enrollment.createdAt).toLocaleDateString("vi-VN")}
                </p>

                <button
                  className="continue-btn"
                  onClick={() =>
                    navigate(`/course/${enrollment.courseId}/learn`)
                  }
                >
                  Vào học
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;

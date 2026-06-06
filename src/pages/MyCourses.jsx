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
          {courses.map((course) => (
            // BE trả về courseId làm định danh khóa học
            <div className="my-course-card" key={course.courseId}>
              <div className="my-course-thumbnail">
                <img
                  src={course.thumbnailUrl}
                  alt={course.courseTitle}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/400x225/4f46e5/white?text=No+Image";
                  }}
                />
                {course.progressPercent === 100 && (
                  <div className="completed-badge">✓ Hoàn thành</div>
                )}
              </div>

              <div className="my-course-body">
                {/* Dùng courseTitle thay vì title */}
                <h3>{course.courseTitle}</h3>

                {/* Kiểm tra totalLessons để hiển thị thanh tiến trình */}
                {course.totalLessons > 0 && (
                  <>
                    <div className="lesson-count">
                      <span>📖</span>
                      <span>
                        {course.completedLessons ?? 0}/{course.totalLessons} bài
                        học
                      </span>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.progressPercent ?? 0}%` }}
                      />
                    </div>

                    <div className="progress-footer">
                      <span className="progress-text">
                        {course.progressPercent ?? 0}% hoàn thành
                      </span>
                    </div>
                  </>
                )}

                <button
                  className="continue-btn"
                  onClick={() => navigate(`/course/${course.courseId}/learn`)}
                >
                  {!course.progressPercent || course.progressPercent === 0
                    ? "Bắt đầu học"
                    : course.progressPercent === 100
                      ? "Xem lại"
                      : "Tiếp tục học"}
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

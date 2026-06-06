import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Features/auth/context/AuthContext";
import "./CSS/MyCourses.css";

const API = "http://localhost:5000";

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
        // Fetch all, filter thủ công để tránh type mismatch
        const [ordersRes, coursesRes, progressRes, lessonsRes] =
          await Promise.all([
            fetch(`${API}/orders`),
            fetch(`${API}/courses`),
            fetch(`${API}/progress`),
            fetch(`${API}/lessons`),
          ]);

        const allOrders = await ordersRes.json();
        const allCourses = await coursesRes.json();
        const allProgress = await progressRes.json();
        const allLessons = await lessonsRes.json();

        // Filter orders theo user, so sánh string để tránh "1" !== 1
        const userOrders = allOrders.filter(
          (o) => String(o.userId) === String(user.id),
        );

        // Dedup theo courseId
        const uniqueOrders = userOrders.filter(
          (order, index, self) =>
            index ===
            self.findIndex(
              (o) => String(o.courseId) === String(order.courseId),
            ),
        );

        const userProgress = allProgress.filter(
          (p) => String(p.userId) === String(user.id),
        );

        const myCourses = uniqueOrders
          .map((order) => {
            const course = allCourses.find(
              (c) => String(c.id) === String(order.courseId),
            );

            if (!course) return null;

            const courseLessons = allLessons.filter(
              (l) => String(l.courseId) === String(order.courseId),
            );

            const completedCount = userProgress.filter(
              (p) =>
                String(p.courseId) === String(order.courseId) && p.completed,
            ).length;

            const percent =
              courseLessons.length > 0
                ? Math.round((completedCount / courseLessons.length) * 100)
                : 0;

            return {
              ...course,
              orderId: order.id,
              progress: percent,
              completed: completedCount,
              totalLessons: courseLessons.length,
            };
          })
          .filter(Boolean);

        setCourses(myCourses);
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
            <div className="my-course-card" key={course.orderId || course.id}>
              <div className="my-course-thumbnail">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/400x225/4f46e5/white?text=No+Image";
                  }}
                />
                {course.progress === 100 && (
                  <div className="completed-badge">✓ Hoàn thành</div>
                )}
              </div>

              <div className="my-course-body">
                <h3>{course.title}</h3>

                <div className="lesson-count">
                  <span>📖</span>
                  <span>
                    {course.completed}/{course.totalLessons} bài học
                  </span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>

                <div className="progress-footer">
                  <span className="progress-text">
                    {course.progress}% hoàn thành
                  </span>
                </div>

                <button
                  className="continue-btn"
                  onClick={() => navigate(`/course/${course.id}/learn`)}
                >
                  {course.progress === 0
                    ? "Bắt đầu học"
                    : course.progress === 100
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

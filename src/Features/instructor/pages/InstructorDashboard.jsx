// src/Features/instructor/pages/InstructorDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInstructorGuard } from "../hooks/useInstructorGuard";
import { fetchStatsService } from "../services/instructorService";
import "../styles/InstructorDashboard.css";

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const { isAllowed } = useInstructorGuard();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchStatsService();
        if (data.success) setStats(data.stats);
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (!isAllowed) return null;

  return (
    <div className="instructor-dashboard">
      <h1>Dashboard</h1>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <>
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>Tổng khóa học</h3>
              <p>{stats?.totalCourses ?? 0}</p>
            </div>
            <div className="dashboard-card">
              <h3>Tổng học viên</h3>
              <p>{stats?.totalStudents ?? 0}</p>
            </div>
            <div className="dashboard-card">
              <h3>Doanh thu</h3>
              <p>{(stats?.totalRevenue ?? 0).toLocaleString("vi-VN")}đ</p>
            </div>
          </div>

          {stats?.recentCourses?.length > 0 && (
            <div className="recent-courses">
              <div className="recent-header">
                <h2>Khóa học gần đây</h2>
                <button
                  className="btn-view-all"
                  onClick={() => navigate("/instructor/courses")}
                >
                  Xem tất cả →
                </button>
              </div>
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>Tên khóa học</th>
                    <th>Học viên</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentCourses.map((course) => (
                    <tr key={course.id}>
                      <td>{course.title}</td>
                      <td>{course.students}</td>
                      <td>
                        <span
                          className={`status-badge status-${course.status}`}
                        >
                          {course.status === "published" ? "Đã đăng" : "Nháp"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InstructorDashboard;

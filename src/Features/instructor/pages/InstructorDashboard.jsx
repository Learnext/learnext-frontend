// src/Instructor/InstructorDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/Context/AuthContext";
import "../styles/InstructorDashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Auth header helper (DRY) ─────────────────────────────────
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
});

// ─── FIX #5: Fake stats thay vì hardcode UI ──────────────────
const FAKE_STATS = {
  totalCourses: 12,
  totalStudents: 320,
  totalRevenue: 15000000,
  recentCourses: [
    {
      id: 1,
      title: "React từ cơ bản đến nâng cao",
      students: 120,
      status: "published",
    },
    { id: 2, title: "Node.js & Express", students: 45, status: "published" },
    { id: 3, title: "UI/UX với Figma", students: 0, status: "draft" },
  ],
};

const InstructorDashboard = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Guard redirect ───────────────────────────────────────
  useEffect(() => {
    if (!authUser || authUser.role !== "instructor") {
      navigate("/");
    }
  }, [authUser, navigate]);

  // ─── Fetch stats từ API ───────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        if (!API_URL) {
          await new Promise((r) => setTimeout(r, 600));
          setStats(FAKE_STATS);
        } else {
          const res = await fetch(`${API_URL}/instructor/stats`, {
            headers: authHeaders(),
          });
          // ─── Check HTTP status ────────────────────────────
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (data.success) setStats(data.stats);
        }
      } catch (err) {
        console.error("Lỗi tải thống kê:", err);
        // Fallback về fake data nếu lỗi
        setStats(FAKE_STATS);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!authUser || authUser.role !== "instructor") return null;

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

          {/* Khóa học gần đây */}
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

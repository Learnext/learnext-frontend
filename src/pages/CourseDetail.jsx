import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../pages/CSS/CourseDetail.css";
import { useAuth } from "../Features/auth/context/AuthContext";

const API = "http://localhost:1201/api/v1";

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const navigate = useNavigate();

  // 1. Tải chi tiết khóa học
  useEffect(() => {
    const loadCourse = async () => {
      try {
        const res = await fetch(`${API}/courses/${id}`);
        const json = await res.json();
        if (json.success) {
          setCourse(json.data);
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết khóa học:", err);
      }
    };
    loadCourse();
  }, [id]);

  // 2. Kiểm tra quyền truy cập (Enrollment)
  useEffect(() => {
    if (!user || !id) return;
    const checkEnrollment = async () => {
      try {
        const token = localStorage.getItem("auth-token");
        const res = await fetch(`${API}/learning/enrollments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();

        const enrollments = json.data || [];
        setIsEnrolled(
          enrollments.some((e) => String(e.courseId) === String(id)),
        );
      } catch (err) {
        console.error("Lỗi kiểm tra quyền học:", err);
      }
    };
    checkEnrollment();
  }, [user, id]);

  // 3. Xử lý "Mua ngay"
  const handleBuyNow = () => {
    if (!user) {
      localStorage.setItem("redirect-after-login", `/course/${id}`);
      navigate("/login");
      return;
    }

    // Chuyển sang trang Checkout, truyền data khóa học qua Router State
    navigate("/checkout", {
      state: {
        courseId: course.id,
        title: course.title,
        price: course.price,
        thumbnailUrl: course.thumbnailUrl,
      },
    });
  };

  if (!course) return <h2>Đang tải chi tiết khóa học...</h2>;

  return (
    <div className="course-detail">
      <div className="course-detail-left">
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.target.src =
              "https://placehold.co/600x400/4f46e5/white?text=No+Image";
          }}
        />
      </div>

      <div className="course-detail-right">
        <h1 className="course-detail-title">{course.title}</h1>
        <p className="course-detail-desc">{course.description}</p>

        <div className="course-detail-price">
          {Number(course.price || 0).toLocaleString()}đ
        </div>

        {/* Nút hành động thay đổi dựa trên trạng thái Enrollment */}
        {isEnrolled ? (
          <button
            className="course-detail-btn"
            /* ĐÃ SỬA: Dùng đúng đường dẫn trong App.js */
            onClick={() => navigate(`/course/${course.id}/learn`)}
          >
            Đã sở hữu - Vào học ngay
          </button>
        ) : (
          <button className="buy-now-btn" onClick={handleBuyNow}>
            Mua ngay
          </button>
        )}

        {/* ĐÃ SỬA: Chỉ hiện nút Học thử nếu backend báo hasPreview === true */}
        {!isEnrolled && course.hasPreview && (
          <button
            className="learn-btn"
            onClick={() => navigate(`/course/${course.id}/learn?preview=true`)}
          >
            Học thử miễn phí
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;

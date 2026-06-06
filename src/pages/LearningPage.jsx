import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../Features/auth/context/AuthContext";
import "./CSS/LearningPage.css";

const API = "http://localhost:1201/api/v1";

const LearningPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get("preview") === "true";

  const [courseTitle, setCourseTitle] = useState("");
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);

  // State dành riêng cho chế độ Preview
  const [previewVideo, setPreviewVideo] = useState(null);

  const [hasBought, setHasBought] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLearningData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("auth-token");
        let isPurchased = false;

        // 1. NẾU USER ĐĂNG NHẬP: Thử gọi API lấy nội dung học thật
        if (token && !isPreviewMode) {
          const learnRes = await fetch(`${API}/me/courses/${courseId}/learn`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (learnRes.ok) {
            const json = await learnRes.json();
            if (json.success) {
              setCourseTitle(json.data.title);
              const sortedLessons = (json.data.lessons || []).sort(
                (a, b) => a.orderIndex - b.orderIndex,
              );
              setLessons(sortedLessons);
              setHasBought(true);
              isPurchased = true;

              const lastId = localStorage.getItem(`lastLesson-${courseId}`);
              const target =
                sortedLessons.find((l) => String(l.id) === lastId) ||
                sortedLessons[0];
              setCurrentLesson(target);
            }
          }
        }

        // 2. NẾU CHƯA MUA HOẶC CỐ TÌNH XEM PREVIEW: Gọi API Public lấy video học thử
        if (!isPurchased) {
          const pubRes = await fetch(`${API}/courses/${courseId}`);
          const pubJson = await pubRes.json();

          if (pubJson.success) {
            const courseData = pubJson.data;
            setCourseTitle(courseData.title);
            setHasBought(false);

            // API-DOCS: Lấy trực tiếp previewVideoUrl từ CourseResponse
            if (courseData.hasPreview && courseData.previewVideoUrl) {
              setPreviewVideo(courseData.previewVideoUrl);
            }
          }
        }
      } catch (err) {
        console.error("Lỗi tải nội dung học:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLearningData();
  }, [courseId, user, isPreviewMode]);

  const handleSelectLesson = (lesson) => {
    localStorage.setItem(`lastLesson-${courseId}`, lesson.id);
    setCurrentLesson(lesson);
  };

  // ĐÃ SỬA: Gọi đúng Endpoint POST theo Swagger
  const markCompleted = async () => {
    if (!hasBought || !currentLesson || currentLesson.isCompleted) return;

    try {
      const token = localStorage.getItem("auth-token");
      const res = await fetch(`${API}/learning/courses/${courseId}/complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // Gửi body tuỳ thuộc vào backend yêu cầu (thường là lessonId)
        body: JSON.stringify({ lessonId: currentLesson.id }),
      });

      const json = await res.json();
      if (json.success) {
        setLessons((prev) =>
          prev.map((l) =>
            l.id === currentLesson.id ? { ...l, isCompleted: true } : l,
          ),
        );
        setCurrentLesson((prev) => ({ ...prev, isCompleted: true }));
      }
    } catch (err) {
      console.error("Lỗi cập nhật tiến độ:", err);
    }
  };

  if (loading) return <h2>Đang tải khóa học...</h2>;

  // Render Màn hình GUEST HỌC THỬ (Không có danh sách bài học, chỉ có video)
  if (!hasBought) {
    return (
      <div className="learning-page" style={{ justifyContent: "center" }}>
        <main
          className="learning-content"
          style={{ maxWidth: "800px", margin: "0 auto" }}
        >
          <div className="lesson-wrapper">
            <h1>Học thử: {courseTitle}</h1>

            {previewVideo ? (
              <video
                controls
                controlsList="nodownload"
                className="lesson-video"
                src={previewVideo}
              />
            ) : (
              <div
                className="preview-cta"
                style={{
                  textAlign: "center",
                  padding: "50px",
                  background: "#f8f9fa",
                }}
              >
                <h2>🔒 Khóa học này không có video học thử</h2>
              </div>
            )}

            <div
              className="preview-cta"
              style={{ textAlign: "center", marginTop: "30px" }}
            >
              <p>Mua khóa học để truy cập toàn bộ nội dung và tài liệu.</p>
              <button
                onClick={() => navigate(`/course/${courseId}`)}
                className="buy-now-btn"
              >
                Xem chi tiết & Đăng ký ngay
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render Màn hình USER ĐÃ MUA (Có Sidebar và tracking tiến độ)
  const completedCount = lessons.filter((l) => l.isCompleted).length;
  const progressPercent =
    Math.round((completedCount / lessons.length) * 100) || 0;
  const currentIndex = lessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="learning-page">
      <aside className="learning-sidebar">
        <h2>{courseTitle}</h2>
        <div className="course-progress">
          <div className="progress-info">
            <span>Tiến độ học tập</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p>
            {completedCount}/{lessons.length} bài học
          </p>
        </div>

        <div className="lesson-list">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className={`lesson-item ${currentLesson?.id === lesson.id ? "active" : ""}`}
              onClick={() => handleSelectLesson(lesson)}
            >
              <span>
                {lesson.documentUrl ? "📄" : "🎬"} {lesson.title}
              </span>
              <span className="lesson-status">
                {lesson.isCompleted ? (
                  <span className="lesson-done">✓</span>
                ) : currentLesson?.id === lesson.id ? (
                  <span className="lesson-current">▶</span>
                ) : null}
              </span>
            </div>
          ))}
        </div>
      </aside>

      <main className="learning-content">
        {currentLesson ? (
          <div className="lesson-wrapper">
            <h1>{currentLesson.title}</h1>
            <div className="lesson-meta">
              <span className="lesson-badge">
                {currentLesson.documentUrl ? "📄 Tài liệu PDF" : "🎬 Video"}
              </span>
            </div>

            {currentLesson.videoUrl ? (
              <video
                controls
                controlsList="nodownload"
                className="lesson-video"
                src={currentLesson.videoUrl}
                onEnded={markCompleted}
              />
            ) : currentLesson.documentUrl ? (
              <iframe
                title="pdf-viewer"
                src={currentLesson.documentUrl}
                className="lesson-pdf"
                width="100%"
                height="600px"
              />
            ) : (
              <div className="no-content">Chưa có dữ liệu bài học.</div>
            )}

            <button
              className={`complete-btn ${currentLesson.isCompleted ? "completed" : ""}`}
              disabled={currentLesson.isCompleted}
              onClick={markCompleted}
            >
              {currentLesson.isCompleted
                ? "✓ Đã hoàn thành"
                : "✓ Đánh dấu hoàn thành"}
            </button>

            <div className="lesson-nav">
              <button
                disabled={!prevLesson}
                onClick={() => handleSelectLesson(prevLesson)}
              >
                ← Bài trước
              </button>
              <button
                disabled={!nextLesson}
                onClick={() => handleSelectLesson(nextLesson)}
              >
                Bài tiếp →
              </button>
            </div>
          </div>
        ) : (
          <div className="lesson-wrapper">
            <h2>Vui lòng chọn một bài học</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default LearningPage;

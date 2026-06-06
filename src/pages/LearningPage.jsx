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
  const [previewLesson, setPreviewLesson] = useState(null);
  const [hasBought, setHasBought] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLearningData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("auth-token");

        // 1. Load course detail (public)
        const pubRes = await fetch(`${API}/courses/${courseId}`);
        const pubJson = await pubRes.json();
        if (pubJson.success) {
          const data = pubJson.data;
          setCourseTitle(data.title);
          if (data.previewLesson) setPreviewLesson(data.previewLesson);
        }

        // 2. Check access nếu có token
        if (token && !isPreviewMode) {
          const accessRes = await fetch(
            `${API}/learning/courses/${courseId}/access`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          const accessJson = await accessRes.json();

          if (accessJson.success && accessJson.data?.access === true) {
            setHasBought(true);
            const lessonsRes = await fetch(
              `${API}/learning/courses/${courseId}/lessons`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            const lessonsJson = await lessonsRes.json();
            if (lessonsJson.success) {
              const loadedLessons = lessonsJson.data || [];
              setLessons(loadedLessons);

              const lastLessonId = localStorage.getItem(
                `lastLesson-${courseId}`,
              );
              setCurrentLesson(
                loadedLessons.find((lesson) => lesson.id === lastLessonId) ||
                  loadedLessons[0] ||
                  null,
              );
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
      console.error(err);
    }
  };

  if (loading) return <h2>Đang tải nội dung...</h2>;

  // Preview mode hoặc chưa mua
  if (!hasBought) {
    return (
      <div className="learning-page" style={{ justifyContent: "center" }}>
        <main className="learning-content" style={{ maxWidth: "800px" }}>
          <h1>Học thử: {courseTitle}</h1>
          {previewLesson?.videoUrl ? (
            <video
              controls
              src={previewLesson.videoUrl}
              className="lesson-video"
            />
          ) : (
            <p>Không có video học thử.</p>
          )}
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="buy-now-btn"
          >
            Đăng ký ngay
          </button>
        </main>
      </div>
    );
  }

  // Đã mua nhưng instructor chưa có lesson content
  if (lessons.length === 0) {
    return (
      <div className="learning-page" style={{ justifyContent: "center" }}>
        <main
          className="learning-content"
          style={{ maxWidth: "800px", textAlign: "center" }}
        >
          <h1>{courseTitle}</h1>
          <div style={{ marginTop: "40px" }}>
            <div style={{ fontSize: "64px" }}>🚧</div>
            <h2>Nội dung đang được cập nhật</h2>
            <p style={{ color: "#6b7280", marginTop: "12px" }}>
              Khóa học đang được instructor chuẩn bị nội dung. Vui lòng quay lại
              sau!
            </p>
            <button
              onClick={() => navigate("/my-courses")}
              className="continue-btn"
              style={{ marginTop: "24px" }}
            >
              Quay lại khóa học của tôi
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Có lesson — render learning UI
  const completedCount = lessons.filter((l) => l.isCompleted).length;
  const progress =
    lessons.length > 0
      ? Math.round((completedCount / lessons.length) * 100)
      : 0;
  const idx = lessons.findIndex((l) => l.id === currentLesson?.id);

  const handleSelectLesson = (lesson) => {
    localStorage.setItem(`lastLesson-${courseId}`, lesson.id);
    setCurrentLesson(lesson);
  };

  return (
    <div className="learning-page">
      <aside className="learning-sidebar">
        <h2>{courseTitle}</h2>

        <div className="course-progress">
          <div className="progress-info">
            <span>Tiến độ</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p>
            {completedCount}/{lessons.length} bài hoàn thành
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
                {lesson.type === "video" ? "🎬" : "📄"} {lesson.title}
              </span>
              {lesson.isCompleted && <span className="lesson-done">✓</span>}
            </div>
          ))}
        </div>
      </aside>

      <main className="learning-content">
        {currentLesson ? (
          <div className="lesson-wrapper">
            <h1>{currentLesson.title}</h1>

            {currentLesson.videoUrl ? (
              <video
                controls
                src={currentLesson.videoUrl}
                onEnded={markCompleted}
                className="lesson-video"
              />
            ) : currentLesson.documentUrl ? (
              <iframe
                src={currentLesson.documentUrl}
                title="pdf-viewer"
                className="lesson-pdf"
              />
            ) : null}

            <button
              className={`complete-btn ${currentLesson.isCompleted ? "completed" : ""}`}
              onClick={markCompleted}
              disabled={currentLesson.isCompleted}
            >
              {currentLesson.isCompleted
                ? "✓ Đã hoàn thành"
                : "Đánh dấu hoàn thành"}
            </button>

            <div className="lesson-nav">
              <button
                disabled={idx <= 0}
                onClick={() => handleSelectLesson(lessons[idx - 1])}
              >
                ← Bài trước
              </button>
              <button
                disabled={idx >= lessons.length - 1}
                onClick={() => handleSelectLesson(lessons[idx + 1])}
              >
                Bài tiếp →
              </button>
            </div>
          </div>
        ) : (
          <div className="lesson-wrapper">
            <h2>Chọn bài học để bắt đầu</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default LearningPage;

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
  const [previewVideo, setPreviewVideo] = useState(null);
  const [hasBought, setHasBought] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLearningData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("auth-token");
        let isPurchased = false;

        if (token && !isPreviewMode) {
          const learnRes = await fetch(`${API}/me/courses/${courseId}/learn`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (learnRes.ok) {
            const json = await learnRes.json();
            if (json.success) {
              setCourseTitle(json.data.title);
              const sorted = (json.data.lessons || []).sort(
                (a, b) => a.orderIndex - b.orderIndex,
              );
              setLessons(sorted);
              setHasBought(true);
              isPurchased = true;

              const lastId = localStorage.getItem(`lastLesson-${courseId}`);
              const target =
                sorted.find((l) => String(l.id) === lastId) || sorted[0];
              setCurrentLesson(target);
            }
          }
        }

        if (!isPurchased) {
          const pubRes = await fetch(`${API}/courses/${courseId}`);
          const pubJson = await pubRes.json();
          if (pubJson.success) {
            setCourseTitle(pubJson.data.title);
            setHasBought(false);
            if (pubJson.data.has_preview)
              setPreviewVideo(pubJson.data.preview_video_url);
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
    if (!hasBought || !currentLesson || currentLesson.is_completed) return;
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
      if ((await res.json()).success) {
        setLessons((prev) =>
          prev.map((l) =>
            l.id === currentLesson.id ? { ...l, is_completed: true } : l,
          ),
        );
        setCurrentLesson((prev) => ({ ...prev, is_completed: true }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <h2>Đang tải nội dung...</h2>;

  // Render Guest Preview
  if (!hasBought) {
    return (
      <div className="learning-page" style={{ justifyContent: "center" }}>
        <main className="learning-content" style={{ maxWidth: "800px" }}>
          <h1>Học thử: {courseTitle}</h1>
          {previewVideo ? (
            <video controls src={previewVideo} className="lesson-video" />
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

  // Render Content đã mua
  const progress =
    Math.round(
      (lessons.filter((l) => l.is_completed).length / lessons.length) * 100,
    ) || 0;
  const idx = lessons.findIndex((l) => l.id === currentLesson?.id);

  return (
    <div className="learning-page">
      <aside className="learning-sidebar">
        <h2>{courseTitle}</h2>
        <div className="progress-bar">
          <div style={{ width: `${progress}%` }} />
        </div>
        <div className="lesson-list">
          {lessons.map((l) => (
            <div
              key={l.id}
              className={`lesson-item ${currentLesson?.id === l.id ? "active" : ""}`}
              onClick={() => setCurrentLesson(l)}
            >
              {l.title} {l.is_completed && "✓"}
            </div>
          ))}
        </div>
      </aside>
      <main className="learning-content">
        {currentLesson && (
          <div className="lesson-wrapper">
            <h1>{currentLesson.title}</h1>
            {currentLesson.video_url ? (
              <video
                controls
                src={currentLesson.video_url}
                onEnded={markCompleted}
                className="lesson-video"
              />
            ) : (
              <iframe
                src={currentLesson.document_url}
                width="100%"
                height="600px"
              />
            )}
            <button
              onClick={markCompleted}
              disabled={currentLesson.is_completed}
            >
              {currentLesson.is_completed
                ? "✓ Đã hoàn thành"
                : "Đánh dấu hoàn thành"}
            </button>
            <div className="lesson-nav">
              <button
                disabled={idx === 0}
                onClick={() => setCurrentLesson(lessons[idx - 1])}
              >
                ← Trước
              </button>
              <button
                disabled={idx === lessons.length - 1}
                onClick={() => setCurrentLesson(lessons[idx + 1])}
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LearningPage;

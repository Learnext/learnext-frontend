import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../Features/auth/context/AuthContext";
import "./CSS/LearningPage.css";

const API = "http://localhost:5000";

const LearningPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState([]);
  const [hasBought, setHasBought] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const requests = [
          fetch(`${API}/courses/${courseId}`),
          fetch(`${API}/chapters?courseId=${courseId}`),
          fetch(`${API}/sections?courseId=${courseId}`),
          fetch(`${API}/lessons?courseId=${courseId}`),
        ];

        if (user?.id) {
          requests.push(fetch(`${API}/progress`));
          requests.push(
            fetch(`${API}/orders?userId=${user.id}&courseId=${courseId}`),
          );
        }

        const responses = await Promise.all(requests);

        const courseData = await responses[0].json();
        const chapterData = await responses[1].json();
        const sectionData = await responses[2].json();
        const lessonData = await responses[3].json();

        let progressData = [];
        let bought = false;

        if (user?.id && responses[4]) {
          const allProgress = await responses[4].json();
          progressData = allProgress.filter(
            (item) =>
              String(item.userId) === String(user.id) &&
              String(item.courseId) === String(courseId),
          );

          const orders = await responses[5].json();
          bought = orders.length > 0;
        }

        setProgress(progressData);
        setHasBought(bought);
        setCourse(courseData);

        const structured = chapterData.map((chapter) => ({
          ...chapter,
          sections: sectionData
            .filter((section) => section.chapterId === chapter.id)
            .map((section) => ({
              ...section,
              lessons: lessonData.filter(
                (lesson) => lesson.sectionId === section.id,
              ),
            })),
        }));

        setChapters(structured);

        if (!currentLesson) {
          const lastLessonId = localStorage.getItem(`lastLesson-${courseId}`);

          const lessons = structured.flatMap((chapter) =>
            chapter.sections.flatMap((section) => section.lessons),
          );

          const savedLesson = lessons.find(
            (lesson) => String(lesson.id) === String(lastLessonId),
          );

          setCurrentLesson(
            savedLesson || structured?.[0]?.sections?.[0]?.lessons?.[0] || null,
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, [courseId, user]);

  const isCompleted = (lessonId) => {
    return progress.some(
      (item) =>
        String(item.lessonId) === String(lessonId) &&
        String(item.userId) === String(user?.id),
    );
  };

  const allLessons = chapters.flatMap((chapter) =>
    chapter.sections.flatMap((section) => section.lessons),
  );

  // Bài đầu tiên được phép xem preview
  const firstLesson = allLessons[0];

  // Kiểm tra bài học có bị khóa không
  const isLocked = (lesson) => {
    if (hasBought) return false; // đã mua → mở hết
    if (isPreview && String(lesson.id) === String(firstLesson?.id))
      return false; // preview → chỉ mở bài đầu
    return true; // còn lại khóa hết
  };

  const handleSelectLesson = (lesson) => {
    if (isLocked(lesson)) {
      alert("Bạn cần mua khóa học để xem bài này!");
      return;
    }

    localStorage.setItem(`lastLesson-${courseId}`, lesson.id);

    setCurrentLesson(lesson);
  };

  const markCompleted = async () => {
    if (!currentLesson || !user) return;

    const exists = progress.find(
      (item) =>
        String(item.lessonId) === String(currentLesson.id) &&
        String(item.userId) === String(user.id),
    );

    if (exists) {
      alert("Bài học đã hoàn thành");
      return;
    }

    const payload = {
      userId: String(user.id),
      courseId: String(courseId),
      lessonId: String(currentLesson.id),
      completed: true,
      completedAt: new Date().toISOString(),
    };

    const res = await fetch(`${API}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setProgress((prev) => [...prev, data]);
    alert("Đã hoàn thành bài học");
  };

  if (!course) return <h2>Đang tải khóa học...</h2>;

  const completedLessons = allLessons.filter((lesson) =>
    isCompleted(lesson.id),
  ).length;

  const progressPercent =
    allLessons.length > 0
      ? Math.round((completedLessons / allLessons.length) * 100)
      : 0;

  const currentIndex = allLessons.findIndex(
    (lesson) => lesson.id === currentLesson?.id,
  );

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const getLessonFile = (file) => {
    if (!file) return "";

    // URL online
    if (file.startsWith("http")) return file;

    // PDF trong public
    if (file.endsWith(".pdf")) {
      return file.startsWith("/") ? file : `/pdf/${file}`;
    }

    // Video trong public/videos
    if (
      file.endsWith(".mp4") ||
      file.endsWith(".mov") ||
      file.endsWith(".webm")
    ) {
      return file.startsWith("/") ? file : `/videos/${file}`;
    }

    return file;
  };

  return (
    <div className="learning-page">
      {/* Sidebar */}
      <aside className="learning-sidebar">
        <h2>{course.title}</h2>

        {/* Banner preview */}
        {isPreview && !hasBought && (
          <div className="preview-banner">
            <p>🔓 Bạn đang xem thử — chỉ bài đầu tiên được mở khóa</p>
            <button onClick={() => navigate(`/course/${courseId}`)}>
              Mua khóa học
            </button>
          </div>
        )}

        {hasBought && (
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
              {completedLessons}/{allLessons.length} bài học hoàn thành
            </p>
          </div>
        )}

        {chapters.map((chapter) => (
          <div key={chapter.id} className="chapter-block">
            <div className="chapter-title">📖 {chapter.title}</div>
            {chapter.sections.map((section) => (
              <div key={section.id}>
                <div className="section-title">📂 {section.title}</div>
                {section.lessons.map((lesson) => {
                  const locked = isLocked(lesson);
                  return (
                    <div
                      key={lesson.id}
                      className={`lesson-item ${currentLesson?.id === lesson.id ? "active" : ""} ${locked ? "locked" : ""}`}
                      onClick={() => handleSelectLesson(lesson)}
                    >
                      <span>
                        {locked ? "🔒" : lesson.type === "video" ? "🎬" : "📄"}{" "}
                        {lesson.title}
                      </span>
                      <span className="lesson-status">
                        {isCompleted(lesson.id) ? (
                          <span className="lesson-done">✓</span>
                        ) : currentLesson?.id === lesson.id ? (
                          <span className="lesson-current">▶</span>
                        ) : null}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </aside>

      {/* Content */}
      <main className="learning-content">
        {currentLesson ? (
          <div className="lesson-wrapper">
            <h1>{currentLesson.title}</h1>

            <div className="lesson-meta">
              <span className="lesson-badge">
                {currentLesson.type === "video" ? "🎬 Video" : "📄 PDF"}
              </span>
              {currentLesson.duration && (
                <span className="lesson-duration">
                  ⏱ {currentLesson.duration}
                </span>
              )}
            </div>

            {currentLesson.type === "video" ? (
              <video
                controls
                controlsList="nodownload"
                className="lesson-video"
                src={getLessonFile(currentLesson.file)}
                onEnded={() => {
                  if (hasBought && !isCompleted(currentLesson.id)) {
                    markCompleted();
                  }
                }}
              />
            ) : (
              <iframe
                title="pdf-viewer"
                src={getLessonFile(currentLesson.file)}
                className="lesson-pdf"
              />
            )}

            {/* Nút mua nếu preview */}
            {isPreview && !hasBought && (
              <div className="preview-cta">
                <p>Mua khóa học để xem toàn bộ {allLessons.length} bài học</p>
                <button onClick={() => navigate(`/course/${courseId}`)}>
                  Mua ngay
                </button>
              </div>
            )}

            {user && hasBought && (
              <button
                className={`complete-btn ${isCompleted(currentLesson.id) ? "completed" : ""}`}
                disabled={isCompleted(currentLesson.id)}
                onClick={markCompleted}
              >
                {isCompleted(currentLesson.id)
                  ? "✓ Đã hoàn thành"
                  : "✓ Hoàn thành bài học"}
              </button>
            )}

            {hasBought && (
              <div className="lesson-nav">
                <button
                  disabled={!prevLesson}
                  onClick={() => {
                    setCurrentLesson(prevLesson);
                    localStorage.setItem(
                      `lastLesson-${courseId}`,
                      prevLesson.id,
                    );
                  }}
                >
                  ← Bài trước
                </button>
                <button
                  disabled={!nextLesson}
                  onClick={() => {
                    setCurrentLesson(nextLesson);
                    localStorage.setItem(
                      `lastLesson-${courseId}`,
                      nextLesson.id,
                    );
                  }}
                >
                  Bài tiếp →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="lesson-wrapper">
            <h2>Chưa có bài học nào</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default LearningPage;

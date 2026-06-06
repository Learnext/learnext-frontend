// src/Features/instructor/components/CourseContent/ChapterList.jsx
import React from "react";

const ChapterList = ({
  chapters = [],
  collapsedChapters,
  collapsedSections,
  toggleChapter,
  toggleSection,
  openModal,
  setDeleteConfirm,
}) => {
  return (
    <div className="chapters-list">
      {chapters.map((chapter) => {
        const sections = Array.isArray(chapter.sections)
          ? chapter.sections
          : [];

        return (
          <div key={chapter.id} className="chapter-block">
            {/* Chapter Header */}
            <div className="chapter-header">
              <button
                className="collapse-btn"
                onClick={() => toggleChapter(chapter.id)}
              >
                {collapsedChapters[chapter.id] ? "▶" : "▼"}
              </button>

              <span className="chapter-title">📖 {chapter.title}</span>

              <div className="chapter-actions">
                <button
                  className="btn-sm btn-add"
                  onClick={() =>
                    openModal("section", {
                      chapterId: chapter.id,
                    })
                  }
                >
                  + Phần
                </button>

                <button
                  className="btn-sm btn-edit"
                  onClick={() =>
                    openModal("chapter", {
                      editing: chapter,
                    })
                  }
                >
                  Sửa
                </button>

                <button
                  className="btn-sm btn-delete"
                  onClick={() =>
                    setDeleteConfirm({
                      type: "chapter",
                      chapterId: chapter.id,
                    })
                  }
                >
                  Xóa
                </button>
              </div>
            </div>

            {/* Sections */}
            {!collapsedChapters[chapter.id] && (
              <div className="sections-list">
                {sections.length === 0 ? (
                  <p className="empty-sections">Chưa có phần nào</p>
                ) : (
                  sections.map((section) => {
                    const lessons = Array.isArray(section.lessons)
                      ? section.lessons
                      : [];

                    return (
                      <div key={section.id} className="section-block">
                        {/* Section Header */}
                        <div className="section-header">
                          <button
                            className="collapse-btn"
                            onClick={() => toggleSection(section.id)}
                          >
                            {collapsedSections[section.id] ? "▶" : "▼"}
                          </button>

                          <span className="section-title">
                            📂 {section.title}
                          </span>

                          <div className="section-actions">
                            <button
                              className="btn-sm btn-add"
                              onClick={() =>
                                openModal("lesson", {
                                  chapterId: chapter.id,
                                  sectionId: section.id,
                                })
                              }
                            >
                              + Bài học
                            </button>

                            <button
                              className="btn-sm btn-edit"
                              onClick={() =>
                                openModal("section", {
                                  chapterId: chapter.id,
                                  editing: section,
                                })
                              }
                            >
                              Sửa
                            </button>

                            <button
                              className="btn-sm btn-delete"
                              onClick={() =>
                                setDeleteConfirm({
                                  type: "section",
                                  chapterId: chapter.id,
                                  sectionId: section.id,
                                })
                              }
                            >
                              Xóa
                            </button>
                          </div>
                        </div>

                        {/* Lessons */}
                        {!collapsedSections[section.id] && (
                          <div className="lessons-list">
                            {lessons.length === 0 ? (
                              <p className="empty-lessons">
                                Chưa có bài học nào
                              </p>
                            ) : (
                              lessons.map((lesson) => (
                                <div key={lesson.id} className="lesson-item">
                                  <span className="lesson-icon">
                                    {lesson.type === "video" ? "🎬" : "📄"}
                                  </span>

                                  <span className="lesson-title">
                                    {lesson.title}
                                  </span>

                                  <span className="lesson-file">
                                    {lesson.file || "Không có file"}
                                  </span>

                                  {lesson.duration && (
                                    <span className="lesson-duration">
                                      ⏱ {lesson.duration}
                                    </span>
                                  )}

                                  <div className="lesson-actions">
                                    <button
                                      className="btn-sm btn-edit"
                                      onClick={() =>
                                        openModal("lesson", {
                                          chapterId: chapter.id,
                                          sectionId: section.id,
                                          editing: lesson,
                                        })
                                      }
                                    >
                                      Sửa
                                    </button>

                                    <button
                                      className="btn-sm btn-delete"
                                      onClick={() =>
                                        setDeleteConfirm({
                                          type: "lesson",
                                          chapterId: chapter.id,
                                          sectionId: section.id,
                                          lessonId: lesson.id,
                                        })
                                      }
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChapterList;

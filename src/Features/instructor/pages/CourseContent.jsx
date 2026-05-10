// src/Components/Instructor/CourseContent.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import "./CourseContent.css";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Fake data ────────────────────────────────────────────────
const FAKE_CONTENT = [
  {
    id: 1,
    title: "Chương 1: Giới thiệu",
    order: 1,
    sections: [
      {
        id: 1,
        title: "Phần 1: Tổng quan",
        order: 1,
        lessons: [
          {
            id: 1,
            title: "Bài 1: Giới thiệu khóa học",
            type: "video",
            file: "intro.mp4",
            duration: "5:00",
          },
          {
            id: 2,
            title: "Bài 2: Cài đặt môi trường",
            type: "pdf",
            file: "setup.pdf",
            duration: null,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Chương 2: Nội dung chính",
    order: 2,
    sections: [
      {
        id: 2,
        title: "Phần 1: Kiến thức cơ bản",
        order: 1,
        lessons: [
          {
            id: 3,
            title: "Bài 1: Khái niệm cơ bản",
            type: "video",
            file: "basic.mp4",
            duration: "10:00",
          },
        ],
      },
    ],
  },
];

const EMPTY_LESSON = { title: "", type: "video", file: null, fileName: "" };

// ─── Auth header helper (DRY) ─────────────────────────────────
const authHeaders = (isJson = false) => ({
  Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
  ...(isJson ? { "Content-Type": "application/json" } : {}),
});

const CourseContent = () => {
  const { courseId } = useParams();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Collapse state
  const [collapsedChapters, setCollapsedChapters] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({});

  // Modal state
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ─── FIX #1: Guard dùng useEffect để redirect ─────────────
  useEffect(() => {
    if (!authUser || authUser.role !== "instructor") {
      navigate("/");
    }
  }, [authUser, navigate]);

  // ─── Load content ─────────────────────────────────────────
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        if (!API_URL) {
          await new Promise((r) => setTimeout(r, 600));
          setChapters(FAKE_CONTENT);
        } else {
          const res = await fetch(
            `${API_URL}/instructor/courses/${courseId}/content`,
            { headers: authHeaders() },
          );
          // ─── FIX #4: Check HTTP status ───────────────────
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (data.success) setChapters(data.chapters);
        }
      } catch (err) {
        console.error("Lỗi tải nội dung:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [courseId]);

  if (!authUser || authUser.role !== "instructor") return null;

  // ─── Collapse toggles ─────────────────────────────────────
  const toggleChapter = (id) =>
    setCollapsedChapters((p) => ({ ...p, [id]: !p[id] }));

  const toggleSection = (id) =>
    setCollapsedSections((p) => ({ ...p, [id]: !p[id] }));

  // ─── Modal helpers ────────────────────────────────────────
  const openModal = (type, extra = {}) => {
    setFormError("");
    setModal({ type, ...extra });
    if (extra.editing) {
      setFormData({ ...extra.editing });
    } else {
      setFormData(type === "lesson" ? { ...EMPTY_LESSON } : { title: "" });
    }
  };

  const closeModal = () => {
    setModal(null);
    setFormData({});
    setFormError("");
  };

  const changeHandler = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, file, fileName: file.name }));
  };

  // ─── CRUD Chapter ─────────────────────────────────────────
  const saveChapter = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError("Vui lòng nhập tên chương");
      return;
    }
    setFormLoading(true);
    try {
      if (!API_URL) {
        await new Promise((r) => setTimeout(r, 500));
        if (modal.editing) {
          setChapters((prev) =>
            prev.map((c) =>
              c.id === modal.editing.id ? { ...c, title: formData.title } : c,
            ),
          );
        } else {
          const newChapter = {
            id: Date.now(),
            title: formData.title,
            order: chapters.length + 1,
            sections: [],
          };
          setChapters((prev) => [...prev, newChapter]);
        }
      } else {
        if (modal.editing) {
          const res = await fetch(
            `${API_URL}/instructor/courses/${courseId}/chapters/${modal.editing.id}`,
            {
              method: "PUT",
              headers: authHeaders(true),
              body: JSON.stringify({ title: formData.title }),
            },
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          setChapters((prev) =>
            prev.map((c) =>
              c.id === modal.editing.id ? { ...c, title: formData.title } : c,
            ),
          );
        } else {
          const res = await fetch(
            `${API_URL}/instructor/courses/${courseId}/chapters`,
            {
              method: "POST",
              headers: authHeaders(true),
              body: JSON.stringify({ title: formData.title }),
            },
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (data.success) setChapters((prev) => [...prev, data.chapter]);
        }
      }
      closeModal();
    } catch (err) {
      console.error(err);
      setFormError("Không thể kết nối server");
    } finally {
      setFormLoading(false);
    }
  };

  const deleteChapter = async () => {
    const { chapterId } = deleteConfirm;
    try {
      if (!API_URL) {
        await new Promise((r) => setTimeout(r, 400));
      } else {
        const res = await fetch(
          `${API_URL}/instructor/courses/${courseId}/chapters/${chapterId}`,
          { method: "DELETE", headers: authHeaders() },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // ─── CRUD Section ─────────────────────────────────────────
  const saveSection = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError("Vui lòng nhập tên phần");
      return;
    }
    setFormLoading(true);
    try {
      if (!API_URL) {
        await new Promise((r) => setTimeout(r, 500));
        if (modal.editing) {
          setChapters((prev) =>
            prev.map((c) =>
              c.id === modal.chapterId
                ? {
                    ...c,
                    sections: c.sections.map((s) =>
                      s.id === modal.editing.id
                        ? { ...s, title: formData.title }
                        : s,
                    ),
                  }
                : c,
            ),
          );
        } else {
          const newSection = {
            id: Date.now(),
            title: formData.title,
            order: 1,
            lessons: [],
          };
          setChapters((prev) =>
            prev.map((c) =>
              c.id === modal.chapterId
                ? { ...c, sections: [...c.sections, newSection] }
                : c,
            ),
          );
        }
      } else {
        // ─── FIX #2: Thêm API call thật cho Section ──────
        if (modal.editing) {
          const res = await fetch(
            `${API_URL}/instructor/courses/${courseId}/chapters/${modal.chapterId}/sections/${modal.editing.id}`,
            {
              method: "PUT",
              headers: authHeaders(true),
              body: JSON.stringify({ title: formData.title }),
            },
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          setChapters((prev) =>
            prev.map((c) =>
              c.id === modal.chapterId
                ? {
                    ...c,
                    sections: c.sections.map((s) =>
                      s.id === modal.editing.id
                        ? { ...s, title: formData.title }
                        : s,
                    ),
                  }
                : c,
            ),
          );
        } else {
          const res = await fetch(
            `${API_URL}/instructor/courses/${courseId}/chapters/${modal.chapterId}/sections`,
            {
              method: "POST",
              headers: authHeaders(true),
              body: JSON.stringify({ title: formData.title }),
            },
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (data.success) {
            setChapters((prev) =>
              prev.map((c) =>
                c.id === modal.chapterId
                  ? { ...c, sections: [...c.sections, data.section] }
                  : c,
              ),
            );
          }
        }
      }
      closeModal();
    } catch (err) {
      console.error(err);
      setFormError("Không thể kết nối server");
    } finally {
      setFormLoading(false);
    }
  };

  const deleteSection = async () => {
    const { chapterId, sectionId } = deleteConfirm;
    try {
      if (!API_URL) {
        await new Promise((r) => setTimeout(r, 400));
      } else {
        const res = await fetch(
          `${API_URL}/instructor/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}`,
          { method: "DELETE", headers: authHeaders() },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId
            ? { ...c, sections: c.sections.filter((s) => s.id !== sectionId) }
            : c,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // ─── CRUD Lesson ──────────────────────────────────────────
  const saveLesson = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError("Vui lòng nhập tên bài học");
      return;
    }
    if (!modal.editing && !formData.file) {
      setFormError("Vui lòng chọn file");
      return;
    }
    setFormLoading(true);
    try {
      if (!API_URL) {
        await new Promise((r) => setTimeout(r, 600));
        if (modal.editing) {
          setChapters((prev) =>
            prev.map((c) =>
              c.id === modal.chapterId
                ? {
                    ...c,
                    sections: c.sections.map((s) =>
                      s.id === modal.sectionId
                        ? {
                            ...s,
                            lessons: s.lessons.map((l) =>
                              l.id === modal.editing.id
                                ? {
                                    ...l,
                                    title: formData.title,
                                    type: formData.type,
                                    file: formData.fileName || l.file,
                                  }
                                : l,
                            ),
                          }
                        : s,
                    ),
                  }
                : c,
            ),
          );
        } else {
          const newLesson = {
            id: Date.now(),
            title: formData.title,
            type: formData.type,
            file: formData.fileName,
            duration: null,
          };
          setChapters((prev) =>
            prev.map((c) =>
              c.id === modal.chapterId
                ? {
                    ...c,
                    sections: c.sections.map((s) =>
                      s.id === modal.sectionId
                        ? { ...s, lessons: [...s.lessons, newLesson] }
                        : s,
                    ),
                  }
                : c,
            ),
          );
        }
      } else {
        const payload = new FormData();
        payload.append("title", formData.title);
        payload.append("type", formData.type);
        if (formData.file) payload.append("file", formData.file);

        const res = await fetch(
          `${API_URL}/instructor/courses/${courseId}/sections/${modal.sectionId}/lessons${
            modal.editing ? `/${modal.editing.id}` : ""
          }`,
          {
            method: modal.editing ? "PUT" : "POST",
            headers: authHeaders(), // không set Content-Type khi dùng FormData
            body: payload,
          },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Cập nhật state từ response server
        if (data.success && !modal.editing) {
          setChapters((prev) =>
            prev.map((c) =>
              c.id === modal.chapterId
                ? {
                    ...c,
                    sections: c.sections.map((s) =>
                      s.id === modal.sectionId
                        ? { ...s, lessons: [...s.lessons, data.lesson] }
                        : s,
                    ),
                  }
                : c,
            ),
          );
        }
      }
      closeModal();
    } catch (err) {
      console.error(err);
      setFormError("Không thể kết nối server");
    } finally {
      setFormLoading(false);
    }
  };

  const deleteLesson = async () => {
    const { chapterId, sectionId, lessonId } = deleteConfirm;
    try {
      if (!API_URL) {
        await new Promise((r) => setTimeout(r, 400));
      } else {
        const res = await fetch(
          `${API_URL}/instructor/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
          { method: "DELETE", headers: authHeaders() },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId
            ? {
                ...c,
                sections: c.sections.map((s) =>
                  s.id === sectionId
                    ? {
                        ...s,
                        lessons: s.lessons.filter((l) => l.id !== lessonId),
                      }
                    : s,
                ),
              }
            : c,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // ─── Delete dispatcher ────────────────────────────────────
  const confirmDelete = () => {
    if (deleteConfirm.type === "chapter") deleteChapter();
    else if (deleteConfirm.type === "section") deleteSection();
    else deleteLesson();
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="course-content-page">
      <div className="content-header">
        <button
          className="btn-back"
          onClick={() => navigate("/instructor/courses")}
        >
          ← Quay lại
        </button>
        <h2>Quản lý nội dung khóa học</h2>
        <button
          className="btn-add-chapter"
          onClick={() => openModal("chapter")}
        >
          + Thêm chương
        </button>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : chapters.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có nội dung nào. Hãy thêm chương đầu tiên!</p>
        </div>
      ) : (
        <div className="chapters-list">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="chapter-block">
              {/* Chapter header */}
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
                      openModal("section", { chapterId: chapter.id })
                    }
                  >
                    + Phần
                  </button>
                  <button
                    className="btn-sm btn-edit"
                    onClick={() => openModal("chapter", { editing: chapter })}
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
                  {chapter.sections.map((section) => (
                    <div key={section.id} className="section-block">
                      {/* Section header */}
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
                          {section.lessons.map((lesson) => (
                            <div key={lesson.id} className="lesson-item">
                              <span className="lesson-icon">
                                {lesson.type === "video" ? "🎬" : "📄"}
                              </span>
                              <span className="lesson-title">
                                {lesson.title}
                              </span>
                              <span className="lesson-file">{lesson.file}</span>
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
                          ))}
                          {section.lessons.length === 0 && (
                            <p className="empty-lessons">Chưa có bài học nào</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── Modal ─────────────────────────────────────────── */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>
              {modal.type === "chapter" &&
                (modal.editing ? "Sửa chương" : "Thêm chương")}
              {modal.type === "section" &&
                (modal.editing ? "Sửa phần" : "Thêm phần")}
              {modal.type === "lesson" &&
                (modal.editing ? "Sửa bài học" : "Thêm bài học")}
            </h3>

            {formError && <p className="form-error">✕ {formError}</p>}

            <form
              onSubmit={
                modal.type === "chapter"
                  ? saveChapter
                  : modal.type === "section"
                    ? saveSection
                    : saveLesson
              }
            >
              <div className="form-group">
                <label>
                  {modal.type === "chapter" && "Tên chương"}
                  {modal.type === "section" && "Tên phần"}
                  {modal.type === "lesson" && "Tên bài học"}
                </label>
                <input
                  name="title"
                  value={formData.title || ""}
                  onChange={changeHandler}
                  placeholder="Nhập tên..."
                  required
                />
              </div>

              {modal.type === "lesson" && (
                <>
                  <div className="form-group">
                    <label>Loại nội dung</label>
                    <select
                      name="type"
                      value={formData.type || "video"}
                      onChange={changeHandler}
                    >
                      <option value="video">🎬 Video</option>
                      <option value="pdf">📄 PDF</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      {modal.editing
                        ? "Thay file mới (bỏ trống nếu không đổi)"
                        : "Upload file *"}
                    </label>
                    <div
                      className="upload-box-sm"
                      onClick={() =>
                        document.getElementById("lesson-file").click()
                      }
                    >
                      {formData.fileName ? (
                        <p>✓ {formData.fileName}</p>
                      ) : (
                        <p>
                          Click để chọn{" "}
                          {formData.type === "video" ? "video (MP4)" : "PDF"}
                        </p>
                      )}
                    </div>
                    <input
                      id="lesson-file"
                      type="file"
                      accept={
                        formData.type === "video"
                          ? "video/*"
                          : "application/pdf"
                      }
                      onChange={handleFile}
                      style={{ display: "none" }}
                    />
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                  disabled={formLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={formLoading}
                >
                  {formLoading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Confirm xóa ──────────────────────────────────── */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-confirm">
            <h3>Xác nhận xóa</h3>
            <p>
              {deleteConfirm.type === "chapter" &&
                "Xóa chương sẽ xóa toàn bộ phần và bài học bên trong!"}
              {deleteConfirm.type === "section" &&
                "Xóa phần sẽ xóa toàn bộ bài học bên trong!"}
              {deleteConfirm.type === "lesson" &&
                "Bạn có chắc muốn xóa bài học này?"}
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Hủy
              </button>
              <button className="btn-delete-confirm" onClick={confirmDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseContent;

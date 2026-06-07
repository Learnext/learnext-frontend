// src/Features/instructor/hooks/useCourseContent.js
import { useState, useEffect } from "react";
import {
  fetchContentService,
  createChapterService,
  updateChapterService,
  deleteChapterService,
  createSectionService,
  updateSectionService,
  deleteSectionService,
  createLessonService,
  updateLessonService,
  deleteLessonService,
} from "../services/instructorService";

const EMPTY_LESSON = {
  title: "",
  type: "video",
  file: null,
  fileName: "",
  existingFileUrl: "",
  videoUrl: "",
  documentUrl: "",
};

const fileNameFromUrl = (url = "") => {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const name = parsed.pathname.split("/").filter(Boolean).pop();
    return name ? decodeURIComponent(name) : url;
  } catch {
    return url;
  }
};

const lessonInitialForm = (lesson) => {
  const existingFileUrl = lesson.file || "";
  return {
    ...EMPTY_LESSON,
    ...lesson,
    file: null,
    fileName: fileNameFromUrl(existingFileUrl),
    existingFileUrl,
  };
};

export const useCourseContent = (courseId) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [collapsedChapters, setCollapsedChapters] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({});

  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ─── Load content ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchContentService(courseId);
        if (data.success) setChapters(data.chapters);
      } catch (err) {
        console.error("Lỗi tải nội dung:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  // ─── Collapse toggles ──────────────────────────────────────
  const toggleChapter = (id) =>
    setCollapsedChapters((p) => ({ ...p, [id]: !p[id] }));

  const toggleSection = (id) =>
    setCollapsedSections((p) => ({ ...p, [id]: !p[id] }));

  // ─── Modal helpers ─────────────────────────────────────────
  const openModal = (type, extra = {}) => {
    setFormError("");
    setModal({ type, ...extra });
    setFormData(
      extra.editing
        ? type === "lesson"
          ? lessonInitialForm(extra.editing)
          : { ...extra.editing }
        : type === "lesson"
          ? { ...EMPTY_LESSON }
          : { title: "" },
    );
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
    setFormData((prev) => ({
      ...prev,
      file,
      fileName: file.name,
      existingFileUrl: "",
    }));
  };

  // ─── CRUD Chapter ──────────────────────────────────────────
  const saveChapter = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setFormError("Vui lòng nhập tên chương");
      return;
    }
    setFormLoading(true);
    try {
      if (modal.editing) {
        await updateChapterService(courseId, modal.editing.id, formData.title);
        setChapters((prev) =>
          prev.map((c) =>
            c.id === modal.editing.id ? { ...c, title: formData.title } : c,
          ),
        );
      } else {
        const data = await createChapterService(courseId, formData.title);
        if (data.success) setChapters((prev) => [...prev, data.chapter]);
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
      await deleteChapterService(courseId, chapterId);
      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // ─── CRUD Section ──────────────────────────────────────────
  const saveSection = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setFormError("Vui lòng nhập tên phần");
      return;
    }
    setFormLoading(true);
    try {
      if (modal.editing) {
        await updateSectionService(
          courseId,
          modal.chapterId,
          modal.editing.id,
          formData.title,
        );
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
        const data = await createSectionService(
          courseId,
          modal.chapterId,
          formData.title,
        );
        if (data.success) {
          setChapters((prev) =>
            prev.map((c) =>
              c.id === modal.chapterId
                ? { ...c, sections: [...(c.sections || []), data.section] }
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

  const deleteSection = async () => {
    const { chapterId, sectionId } = deleteConfirm;
    try {
      await deleteSectionService(courseId, chapterId, sectionId);
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

  // ─── CRUD Lesson ───────────────────────────────────────────
  const saveLesson = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setFormError("Vui lòng nhập tên bài học");
      return;
    }
    if (!modal.editing && !formData.file && !formData.videoUrl) {
      setFormError("Vui lòng upload file hoặc nhập URL");
      return;
    }
    setFormLoading(true);
    try {
      if (modal.editing) {
        const data = await updateLessonService(
          courseId,
          modal.sectionId,
          modal.editing.id,
          formData,
        );
        const updatedLesson = data.lesson || {
          ...modal.editing,
          title: formData.title,
          type: formData.type,
          videoUrl: formData.videoUrl,
          documentUrl: formData.documentUrl,
          file: formData.existingFileUrl,
        };
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
                              ? updatedLesson
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
        const data = await createLessonService(
          courseId,
          modal.sectionId,
          formData,
        );
        if (data.success) {
          setChapters((prev) =>
            prev.map((c) =>
              c.id === modal.chapterId
                ? {
                    ...c,
                    sections: c.sections.map((s) =>
                      s.id === modal.sectionId
                        ? { ...s, lessons: [...(s.lessons || []), data.lesson] }
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
      await deleteLessonService(courseId, sectionId, lessonId);
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

  // ─── Delete dispatcher ─────────────────────────────────────
  const confirmDelete = () => {
    if (deleteConfirm.type === "chapter") deleteChapter();
    else if (deleteConfirm.type === "section") deleteSection();
    else deleteLesson();
  };

  return {
    chapters,
    loading,
    collapsedChapters,
    collapsedSections,
    toggleChapter,
    toggleSection,
    modal,
    formData,
    formLoading,
    formError,
    deleteConfirm,
    setDeleteConfirm,
    openModal,
    closeModal,
    changeHandler,
    handleFile,
    saveChapter,
    saveSection,
    saveLesson,
    confirmDelete,
  };
};

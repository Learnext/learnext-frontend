// src/Features/instructor/pages/CourseContent.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInstructorGuard } from "../hooks/useInstructorGuard";
import { useCourseContent } from "../hooks/useCourseContent";
import ChapterList from "../components/CourseContent/ChapterList";
import ContentModal from "../components/CourseContent/ContentModal";
import DeleteModal from "../components/DeleteModal";
import "../styles/CourseContent.css";

const DELETE_MESSAGES = {
  chapter: "Xóa chương sẽ xóa toàn bộ phần và bài học bên trong!",
  section: "Xóa phần sẽ xóa toàn bộ bài học bên trong!",
  lesson: "Bạn có chắc muốn xóa bài học này?",
};

const CourseContent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAllowed } = useInstructorGuard();

  const {
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
  } = useCourseContent(courseId);

  if (!isAllowed) return null;

  const onSubmit =
    modal?.type === "chapter"
      ? saveChapter
      : modal?.type === "section"
        ? saveSection
        : saveLesson;

  return (
    <div className="course-content-page">
      {/* ─── Header ─── */}
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

      {/* ─── Body ─── */}
      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : chapters.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có nội dung nào. Hãy thêm chương đầu tiên!</p>
        </div>
      ) : (
        <ChapterList
          chapters={chapters}
          collapsedChapters={collapsedChapters}
          collapsedSections={collapsedSections}
          toggleChapter={toggleChapter}
          toggleSection={toggleSection}
          openModal={openModal}
          setDeleteConfirm={setDeleteConfirm}
        />
      )}

      {/* ─── Modal thêm/sửa ─── */}
      {modal && (
        <ContentModal
          modal={modal}
          formData={formData}
          formLoading={formLoading}
          formError={formError}
          changeHandler={changeHandler}
          handleFile={handleFile}
          onSubmit={onSubmit}
          onClose={closeModal}
        />
      )}

      {/* ─── Modal xóa ─── */}
      {deleteConfirm && (
        <DeleteModal
          message={DELETE_MESSAGES[deleteConfirm.type]}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default CourseContent;

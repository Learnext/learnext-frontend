// src/Features/instructor/pages/CourseManager.jsx
import React from "react";
import { useInstructorGuard } from "../hooks/useInstructorGuard";
import { useCourseManager } from "../hooks/useCourseManager";
import CourseTable from "../components/CourseManager/CourseTable";
import CourseForm from "../components/CourseManager/CourseForm";
import DeleteModal from "../components/DeleteModal";
import "../styles/CourseManager.css";

const CourseManager = () => {
  const { isAllowed } = useInstructorGuard();
  const {
    courses,
    loadingList,
    view,
    setView,
    formData,
    formLoading,
    formError,
    formSuccess,
    deleteConfirm,
    setDeleteConfirm,
    changeHandler,
    handleThumbnail,
    handleIntroVideo,
    openCreate,
    openEdit,
    handleCreate,
    handleEdit,
    handleDelete,
  } = useCourseManager();

  if (!isAllowed) return null;

  // ─── List view ─────────────────────────────────────────────
  if (view === "list") {
    return (
      <div className="course-manager">
        <div className="course-list-wrapper">
          <div className="course-list-header">
            <h2>Khóa học của tôi</h2>
            <button className="btn-create" onClick={openCreate}>
              + Tạo khóa học mới
            </button>
          </div>

          {loadingList ? (
            <div className="loading">Đang tải...</div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <p>Bạn chưa có khóa học nào.</p>
              <button className="btn-create" onClick={openCreate}>
                Tạo ngay
              </button>
            </div>
          ) : (
            <CourseTable
              courses={courses}
              onEdit={openEdit}
              onDelete={setDeleteConfirm}
            />
          )}
        </div>

        {deleteConfirm && (
          <DeleteModal
            message="Bạn có chắc muốn xóa khóa học này? Hành động không thể hoàn tác."
            onConfirm={() => handleDelete(deleteConfirm)}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
      </div>
    );
  }

  // ─── Create / Edit view ────────────────────────────────────
  return (
    <div className="course-manager">
      <CourseForm
        view={view}
        formData={formData}
        formLoading={formLoading}
        formError={formError}
        formSuccess={formSuccess}
        changeHandler={changeHandler}
        handleThumbnail={handleThumbnail}
        handleIntroVideo={handleIntroVideo}
        onSubmit={view === "create" ? handleCreate : handleEdit}
        onCancel={() => setView("list")}
      />
    </div>
  );
};

export default CourseManager;

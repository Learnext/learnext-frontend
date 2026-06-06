// src/Features/instructor/components/CourseContent/ContentModal.jsx
import React from "react";

const MODAL_TITLES = {
  chapter: { add: "Thêm chương", edit: "Sửa chương" },
  section: { add: "Thêm phần", edit: "Sửa phần" },
  lesson: { add: "Thêm bài học", edit: "Sửa bài học" },
};

const ContentModal = ({
  modal,
  formData,
  formLoading,
  formError,
  changeHandler,
  handleFile,
  onSubmit,
  onClose,
}) => {
  const titles = MODAL_TITLES[modal.type];
  const title = modal.editing ? titles.edit : titles.add;

  const labelMap = {
    chapter: "Tên chương",
    section: "Tên phần",
    lesson: "Tên bài học",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>

        {formError && <p className="form-error">✕ {formError}</p>}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>{labelMap[modal.type]}</label>
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
              {" "}
              <div className="form-group">
                {" "}
                <label>Loại nội dung</label>
                <select
                  name="type"
                  value={formData.type || "video"}
                  onChange={changeHandler}
                >
                  {" "}
                  <option value="video">🎬 Video</option>{" "}
                  <option value="pdf">📄 PDF</option>{" "}
                </select>{" "}
              </div>
              ```
              {/* URL video */}
              {formData.type === "video" && (
                <div className="form-group">
                  <label>URL Video (Youtube, Vimeo, MP4...)</label>
                  <input
                    type="text"
                    name="videoUrl"
                    value={formData.videoUrl || ""}
                    onChange={changeHandler}
                    placeholder="https://..."
                  />
                </div>
              )}
              {/* Upload file */}
              <div className="form-group">
                <label>
                  {modal.editing
                    ? "Thay file mới (không bắt buộc)"
                    : "Upload file"}
                </label>

                <div
                  className="upload-box-sm"
                  onClick={() => document.getElementById("lesson-file").click()}
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
                    formData.type === "video" ? "video/*" : "application/pdf"
                  }
                  onChange={handleFile}
                  style={{ display: "none" }}
                />
              </div>
              ```
            </>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={formLoading}
            >
              Hủy
            </button>
            <button type="submit" className="btn-save" disabled={formLoading}>
              {formLoading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentModal;

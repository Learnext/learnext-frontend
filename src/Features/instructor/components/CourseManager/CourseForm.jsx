// src/Features/instructor/components/CourseManager/CourseForm.jsx
import React from "react";

const CATEGORIES = [
  "Lập trình",
  "Thiết kế",
  "Marketing",
  "Kinh doanh",
  "Ngoại ngữ",
  "Khác",
];

const CourseForm = ({
  view,
  formData,
  formLoading,
  formError,
  formSuccess,
  changeHandler,
  handleThumbnail,
  handleIntroVideo,
  onSubmit,
  onCancel,
}) => {
  return (
    <div className="course-form-wrapper">
      <div className="course-form-header">
        <button className="btn-back" onClick={onCancel}>
          ← Quay lại
        </button>
        <h2>{view === "create" ? "Tạo khóa học mới" : "Chỉnh sửa khóa học"}</h2>
      </div>

      {formError && <div className="form-error">✕ {formError}</div>}
      {formSuccess && <div className="form-success">{formSuccess}</div>}

      <form className="course-form" onSubmit={onSubmit}>
        {/* Thông tin cơ bản */}
        <div className="form-section">
          <h3>Thông tin cơ bản</h3>

          <div className="form-group">
            <label>
              Tên khóa học <span className="required">*</span>
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={changeHandler}
              placeholder="VD: React từ cơ bản đến nâng cao"
              required
            />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={changeHandler}
              placeholder="Mô tả nội dung khóa học..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Giá (VNĐ) <span className="required">*</span>
              </label>
              <input
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={changeHandler}
                placeholder="VD: 299000"
                required
              />
            </div>
            <div className="form-group">
              <label>
                Danh mục <span className="required">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={changeHandler}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <input
              name="tags"
              value={formData.tags}
              onChange={changeHandler}
              placeholder="VD: react, javascript, frontend (cách nhau bởi dấu phẩy)"
            />
          </div>
        </div>

        {/* Media */}
        <div className="form-section">
          <h3>Hình ảnh & Video giới thiệu</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Ảnh thumbnail</label>
              <div
                className="upload-box"
                onClick={() =>
                  document.getElementById("thumbnail-input").click()
                }
              >
                {formData.thumbnailPreview ? (
                  <img
                    src={formData.thumbnailPreview}
                    alt="thumbnail"
                    className="thumbnail-preview"
                  />
                ) : (
                  <div className="upload-placeholder">
                    <span>🖼️</span>
                    <p>Click để chọn ảnh</p>
                    <small>JPG, PNG — tối đa 5MB</small>
                  </div>
                )}
              </div>
              <input
                id="thumbnail-input"
                type="file"
                accept="image/*"
                onChange={handleThumbnail}
                style={{ display: "none" }}
              />
            </div>

            <div className="form-group">
              <label>Video giới thiệu</label>
              <div
                className="upload-box"
                onClick={() => document.getElementById("video-input").click()}
              >
                {formData.introVideoName ? (
                  <div className="upload-placeholder">
                    <span>🎬</span>
                    <p style={{ wordBreak: "break-all", fontSize: "13px" }}>
                      {formData.introVideoName}
                    </p>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <span>🎬</span>
                    <p>Click để chọn video</p>
                    <small>MP4</small>
                  </div>
                )}
              </div>
              <input
                id="video-input"
                type="file"
                accept="video/*"
                onChange={handleIntroVideo}
                style={{ display: "none" }}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            disabled={formLoading}
          >
            Hủy
          </button>
          <button type="submit" className="btn-save" disabled={formLoading}>
            {formLoading
              ? "Đang lưu..."
              : view === "create"
                ? "Tạo khóa học"
                : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;

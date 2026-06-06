// src/Features/instructor/components/CourseManager/CourseForm.jsx

import React, { useEffect, useState } from "react";

const CourseForm = ({
  view,
  formData,
  formLoading,
  formError,
  formSuccess,
  changeHandler,
  handleThumbnail,
  onSubmit,
  onCancel,
}) => {
  const [categories, setCategories] = useState([]);

  // Load categories từ backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/categories");

        if (!res.ok) {
          setCategories([]);
          return;
        }

        const data = await res.json();

        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi load categories:", err);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  return (
    <div className="course-form-wrapper">
      {/* Header */}
      <div className="course-form-header">
        <button className="btn-back" onClick={onCancel}>
          ← Quay lại
        </button>

        <h2>{view === "create" ? "Tạo khóa học mới" : "Chỉnh sửa khóa học"}</h2>
      </div>

      {/* Alert */}
      {formError && <div className="form-error">✕ {formError}</div>}

      {formSuccess && <div className="form-success">✓ {formSuccess}</div>}

      {/* Form */}
      <form className="course-form" onSubmit={onSubmit}>
        {/* ================= BASIC INFO ================= */}
        <div className="form-section">
          <h3>Thông tin cơ bản</h3>

          {/* Title */}
          <div className="form-group">
            <label>
              Tên khóa học <span className="required">*</span>
            </label>

            <input
              type="text"
              name="title"
              value={formData.title || ""}
              onChange={changeHandler}
              placeholder="VD: ReactJS từ cơ bản đến nâng cao"
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Mô tả khóa học</label>

            <textarea
              name="description"
              value={formData.description || ""}
              onChange={changeHandler}
              placeholder="Nhập mô tả khóa học..."
              rows={5}
            />
          </div>

          {/* Price + Category */}
          <div className="form-row">
            <div className="form-group">
              <label>
                Giá khóa học (VNĐ)
                <span className="required">*</span>
              </label>

              <input
                type="number"
                name="price"
                min="0"
                value={formData.price || ""}
                onChange={changeHandler}
                placeholder="VD: 299000"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Danh mục
                <span className="required">*</span>
              </label>

              <select
                name="category"
                value={formData.category || ""}
                onChange={changeHandler}
                required
              >
                <option value="">-- Chọn danh mục --</option>

                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>

            <input
              type="text"
              name="tags"
              value={formData.tags || ""}
              onChange={changeHandler}
              placeholder="VD: react, frontend, javascript"
            />
          </div>
        </div>

        {/* ================= MEDIA ================= */}
        <div className="form-section">
          <h3>Hình ảnh & Video</h3>

          <div className="form-row">
            {/* Thumbnail */}
            <div className="form-group">
              <label>Thumbnail khóa học</label>

              <div
                className="upload-box"
                onClick={() =>
                  document.getElementById("thumbnail-input").click()
                }
              >
                {formData.thumbnailUrl ? (
                  <img
                    src={formData.thumbnailUrl}
                    alt="thumbnail"
                    className="thumbnail-preview"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/400x225/4f46e5/white?text=No+Image";
                    }}
                  />
                ) : formData.thumbnailPreview ? (
                  <img
                    src={formData.thumbnailPreview}
                    alt="thumbnail"
                    className="thumbnail-preview"
                  />
                ) : (
                  <div className="upload-placeholder">
                    <span>🖼️</span>

                    <p>Click để upload thumbnail</p>

                    <small>JPG, PNG, WEBP — tối đa 5MB</small>
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

              {/* URL ảnh */}
              <div className="form-group mt-10">
                <label>Hoặc nhập URL ảnh</label>

                <input
                  type="text"
                  name="thumbnailUrl"
                  value={formData.thumbnailUrl || ""}
                  onChange={changeHandler}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= PREVIEW ================= */}
        {(formData.thumbnailPreview ||
          formData.thumbnailUrl ||
          formData.title ||
          formData.price) && (
          <div className="form-section">
            <h3>Xem trước</h3>

            <div className="course-preview-card">
              <div className="preview-image">
                <img
                  src={
                    formData.thumbnailUrl ||
                    formData.thumbnailPreview ||
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"
                  }
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/400x225/4f46e5/white?text=No+Image";
                  }}
                />
              </div>

              <div className="preview-content">
                <h4>{formData.title || "Tên khóa học sẽ hiển thị ở đây"}</h4>

                <p>
                  {formData.description || "Mô tả khóa học sẽ hiển thị ở đây"}
                </p>

                <div className="preview-price">
                  {formData.price
                    ? `${Number(formData.price).toLocaleString("vi-VN")}đ`
                    : "0đ"}
                </div>

                {formData.category && (
                  <div className="preview-category">{formData.category}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= ACTIONS ================= */}
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

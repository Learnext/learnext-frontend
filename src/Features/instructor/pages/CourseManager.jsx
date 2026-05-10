// src/Components/Instructor/CourseManager.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/Context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/CourseManager.css";

const API_URL = import.meta.env.VITE_API_URL;

// ─── Fake data ───────────────────────────────────────────────
const FAKE_COURSES = [
  {
    id: 1,
    title: "React từ cơ bản đến nâng cao",
    description: "Học React hoàn chỉnh",
    price: 299000,
    category: "Lập trình",
    tags: "react,frontend",
    thumbnail: null,
    intro_video: null,
    status: "published",
    students: 120,
    created_at: "2024-01-01",
  },
  {
    id: 2,
    title: "Node.js & Express",
    description: "Backend với Node.js",
    price: 199000,
    category: "Lập trình",
    tags: "nodejs,backend",
    thumbnail: null,
    intro_video: null,
    status: "draft",
    students: 0,
    created_at: "2024-02-01",
  },
];

const CATEGORIES = [
  "Lập trình",
  "Thiết kế",
  "Marketing",
  "Kinh doanh",
  "Ngoại ngữ",
  "Khác",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  price: "",
  category: "",
  tags: "",
  thumbnail: null,
  thumbnailPreview: null,
  intro_video: null,
  introVideoName: "",
};

// ─── Auth header helper (DRY) ─────────────────────────────────
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
});

// ─── Whitelist các field hợp lệ để gửi lên server ────────────
const ALLOWED_FIELDS = ["title", "description", "price", "category", "tags"];

const CourseManager = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [view, setView] = useState("list");
  const [editingCourse, setEditingCourse] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ─── FIX #1: Guard dùng useEffect để redirect ─────────────
  useEffect(() => {
    if (!authUser || authUser.role !== "instructor") {
      navigate("/");
    }
  }, [authUser, navigate]);

  // ─── UC08: Load danh sách khóa học ───────────────────────
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingList(true);
      try {
        if (!API_URL) {
          await new Promise((res) => setTimeout(res, 600));
          setCourses(FAKE_COURSES);
        } else {
          const res = await fetch(`${API_URL}/instructor/courses`, {
            headers: authHeaders(),
          });
          // ─── FIX #4: Check HTTP status ───────────────────
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (data.success) setCourses(data.courses);
        }
      } catch (err) {
        console.error("Lỗi tải khóa học:", err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchCourses();
  }, []);

  if (!authUser || authUser.role !== "instructor") return null;

  // ─── Handlers form ────────────────────────────────────────
  const changeHandler = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // ─── FIX #8: Revoke blob URL cũ trước khi tạo mới ─────
    if (formData.thumbnailPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(formData.thumbnailPreview);
    }
    setFormData((prev) => ({
      ...prev,
      thumbnail: file,
      thumbnailPreview: URL.createObjectURL(file),
    }));
  };

  const handleIntroVideo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      intro_video: file,
      introVideoName: file.name,
    }));
  };

  const openCreate = () => {
    // Revoke blob URL nếu còn tồn tại
    if (formData.thumbnailPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(formData.thumbnailPreview);
    }
    setFormData(EMPTY_FORM);
    setFormError("");
    setFormSuccess("");
    setEditingCourse(null);
    setView("create");
  };

  const openEdit = (course) => {
    if (formData.thumbnailPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(formData.thumbnailPreview);
    }
    setFormData({
      title: course.title,
      description: course.description || "",
      price: course.price,
      category: course.category,
      tags: course.tags || "",
      thumbnail: null,
      thumbnailPreview: course.thumbnail || null,
      intro_video: null,
      introVideoName: course.intro_video || "",
    });
    setFormError("");
    setFormSuccess("");
    setEditingCourse(course);
    setView("edit");
  };

  // ─── Tạo FormData payload (chỉ gửi field hợp lệ) ─────────
  const buildPayload = (data) => {
    const payload = new FormData();
    // ─── FIX #7: Whitelist field — không gửi thumbnailPreview
    ALLOWED_FIELDS.forEach((key) => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== "") {
        payload.append(key, data[key]);
      }
    });
    // File chỉ append khi user thực sự chọn file mới
    if (data.thumbnail instanceof File) {
      payload.append("thumbnail", data.thumbnail);
    }
    if (data.intro_video instanceof File) {
      payload.append("intro_video", data.intro_video);
    }
    return payload;
  };

  // ─── UC05: Tạo khóa học ───────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.price) {
      setFormError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setFormLoading(true);
    setFormError("");
    try {
      let newCourse;
      if (!API_URL) {
        await new Promise((res) => setTimeout(res, 800));
        newCourse = {
          id: Date.now(),
          ...formData,
          thumbnail: formData.thumbnailPreview,
          intro_video: formData.introVideoName,
          status: "draft",
          students: 0,
          created_at: new Date().toISOString().split("T")[0],
        };
        setCourses((prev) => [newCourse, ...prev]);
      } else {
        const payload = buildPayload(formData);
        const res = await fetch(`${API_URL}/instructor/courses`, {
          method: "POST",
          headers: authHeaders(),
          body: payload,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.success) {
          setFormError(data.message || "Tạo khóa học thất bại");
          return;
        }
        newCourse = data.course;
        setCourses((prev) => [newCourse, ...prev]);
      }
      setFormSuccess("✓ Tạo khóa học thành công!");
      setTimeout(() => {
        setFormSuccess("");
        setView("list");
      }, 1500);
    } catch (err) {
      console.error(err);
      setFormError("Không thể kết nối server");
    } finally {
      setFormLoading(false);
    }
  };

  // ─── UC07: Sửa khóa học ───────────────────────────────────
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.price) {
      setFormError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setFormLoading(true);
    setFormError("");
    try {
      let updatedCourse;
      if (!API_URL) {
        await new Promise((res) => setTimeout(res, 800));
        updatedCourse = {
          ...editingCourse,
          ...formData,
          thumbnail: formData.thumbnailPreview || editingCourse.thumbnail,
          intro_video: formData.introVideoName || editingCourse.intro_video,
        };
        setCourses((prev) =>
          prev.map((c) => (c.id === editingCourse.id ? updatedCourse : c)),
        );
      } else {
        const payload = buildPayload(formData);
        const res = await fetch(
          `${API_URL}/instructor/courses/${editingCourse.id}`,
          {
            method: "PUT",
            headers: authHeaders(),
            body: payload,
          },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.success) {
          setFormError(data.message || "Cập nhật thất bại");
          return;
        }
        updatedCourse = data.course;
        setCourses((prev) =>
          prev.map((c) => (c.id === editingCourse.id ? updatedCourse : c)),
        );
      }
      setFormSuccess("✓ Cập nhật khóa học thành công!");
      setTimeout(() => {
        setFormSuccess("");
        setView("list");
      }, 1500);
    } catch (err) {
      console.error(err);
      setFormError("Không thể kết nối server");
    } finally {
      setFormLoading(false);
    }
  };

  // ─── UC07: Xóa khóa học ───────────────────────────────────
  const handleDelete = async (id) => {
    try {
      if (!API_URL) {
        await new Promise((res) => setTimeout(res, 500));
      } else {
        const res = await fetch(`${API_URL}/instructor/courses/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.success) return;
      }
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // ─── Render form (dùng chung Create & Edit) ───────────────
  const renderForm = () => (
    <div className="course-form-wrapper">
      <div className="course-form-header">
        <button className="btn-back" onClick={() => setView("list")}>
          ← Quay lại
        </button>
        <h2>{view === "create" ? "Tạo khóa học mới" : "Chỉnh sửa khóa học"}</h2>
      </div>

      {formError && <div className="form-error">✕ {formError}</div>}
      {formSuccess && <div className="form-success">{formSuccess}</div>}

      <form
        className="course-form"
        onSubmit={view === "create" ? handleCreate : handleEdit}
      >
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
            onClick={() => setView("list")}
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

  // ─── Render danh sách (UC08) ──────────────────────────────
  const renderList = () => (
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
        <div className="course-table-wrapper">
          <table className="course-table">
            <thead>
              <tr>
                <th>Khóa học</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Học viên</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <div className="course-title-cell">
                      <div className="course-thumb-small">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt="" />
                        ) : (
                          <div className="thumb-placeholder">📚</div>
                        )}
                      </div>
                      <span>{course.title}</span>
                    </div>
                  </td>
                  <td>{course.category}</td>
                  <td>{Number(course.price).toLocaleString("vi-VN")}đ</td>
                  <td>{course.students}</td>
                  <td>
                    <span className={`status-badge status-${course.status}`}>
                      {course.status === "published" ? "Đã đăng" : "Nháp"}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="btn-action btn-manage"
                        onClick={() =>
                          navigate(`/instructor/courses/${course.id}/content`)
                        }
                      >
                        Nội dung
                      </button>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => openEdit(course)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => setDeleteConfirm(course.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm xóa */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-confirm">
            <h3>Xác nhận xóa</h3>
            <p>
              Bạn có chắc muốn xóa khóa học này? Hành động không thể hoàn tác.
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Hủy
              </button>
              <button
                className="btn-delete-confirm"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="course-manager">
      {view === "list" && renderList()}
      {(view === "create" || view === "edit") && renderForm()}
    </div>
  );
};

export default CourseManager;

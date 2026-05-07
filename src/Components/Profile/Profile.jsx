import React, { useState } from "react";
import "./Profile.css";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const { user: authUser, login: authLogin } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: authUser?.username || "",
    phone: authUser?.phone || "",
    bio: authUser?.bio || "",
    expertise: authUser?.expertise || "",
  });

  if (!authUser) {
    navigate("/login");
    return null;
  }

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let updatedUser;

      if (!API_URL) {
        await new Promise((res) => setTimeout(res, 800));
        updatedUser = { ...authUser, ...formData };
      } else {
        const response = await fetch(`${API_URL}/user/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (!data.success) {
          setError(data.message || "Cập nhật thất bại");
          return;
        }
        updatedUser = { ...authUser, ...data.user };
      }

      authLogin(localStorage.getItem("auth-token"), updatedUser);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: authUser.username || "",
      phone: authUser.phone || "",
      bio: authUser.bio || "",
      expertise: authUser.expertise || "",
    });
    setEditing(false);
    setError("");
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {authUser.username?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
          <div className="profile-header-info">
            <h2>{authUser.username}</h2>
            <span className={`role-badge role-${authUser.role}`}>
              {authUser.role === "instructor" ? "Giảng viên" : "Học viên"}
            </span>
            <p className="profile-email">{authUser.email}</p>
          </div>
          {!editing && (
            <button className="btn-edit" onClick={() => setEditing(true)}>
              Chỉnh sửa
            </button>
          )}
        </div>

        {/* Thông báo */}
        {saved && (
          <div className="save-success">✓ Cập nhật thông tin thành công!</div>
        )}
        {error && <div className="save-error">✕ {error}</div>}

        {/* Form */}
        <form className="profile-form" onSubmit={handleSave}>
          <div className="form-section">
            <h3>Thông tin cá nhân</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Họ và tên</label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={changeHandler}
                  disabled={!editing}
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={changeHandler}
                  disabled={!editing}
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                value={authUser.email}
                disabled={true}
                type="email"
              />
              {editing && (
                <small style={{ color: "#aaa" }}>
                  Email không thể thay đổi
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Giới thiệu bản thân</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={changeHandler}
                disabled={!editing}
                placeholder="Viết vài dòng về bạn..."
                rows={3}
              />
            </div>
          </div>

          {/* Instructor only */}
          {authUser.role === "instructor" && (
            <div className="form-section instructor-section">
              <h3>Thông tin giảng viên</h3>
              <div className="form-group">
                <label>Chuyên môn</label>
                <input
                  name="expertise"
                  value={formData.expertise}
                  onChange={changeHandler}
                  disabled={!editing}
                  placeholder="VD: React, Node.js, UI/UX Design..."
                />
              </div>
              <div className="instructor-stats">
                <div className="stat-card">
                  <span className="stat-number">
                    {authUser.courses_count || 0}
                  </span>
                  <span className="stat-label">Khóa học đã tạo</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Học viên</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Đánh giá</span>
                </div>
              </div>
            </div>
          )}

          {editing && (
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Hủy
              </button>
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;

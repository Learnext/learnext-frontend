import React, { useState } from "react";
import "./Profile.css";

// Mock user data - thay bằng API call thực tế
const mockUser = {
  username: "Nguyen Van A",
  email: "nguyenvana@email.com",
  phone: "0901234567",
  role: "user", // "user" | "instructor"
  avatar: null,
  bio: "",
  // instructor only
  expertise: "",
  courses_count: 0,
};

const Profile = () => {
  const [user, setUser] = useState(mockUser);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...mockUser });
  const [saved, setSaved] = useState(false);
  const [roleSwitch, setRoleSwitch] = useState(user.role); // demo role toggle

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setUser({ ...formData, role: roleSwitch });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setFormData({ ...user });
    setEditing(false);
  };

  const handleRoleSwitch = (role) => {
    setRoleSwitch(role);
    setFormData({ ...formData, role });
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.username ? user.username.charAt(0).toUpperCase() : "U"}
            </div>
            {editing && <button className="avatar-change-btn">Đổi ảnh</button>}
          </div>
          <div className="profile-header-info">
            <h2>{user.username}</h2>
            <span className={`role-badge role-${user.role}`}>
              {user.role === "instructor" ? "Giảng viên" : "Học viên"}
            </span>
            <p className="profile-email">{user.email}</p>
          </div>
          {!editing && (
            <button className="btn-edit" onClick={() => setEditing(true)}>
              Chỉnh sửa
            </button>
          )}
        </div>

        {/* Role Switch - Demo only, in real app this comes from backend */}
        <div className="role-switch-bar">
          <span>Xem dưới vai trò:</span>
          <div className="role-tabs">
            <button
              className={roleSwitch === "user" ? "active" : ""}
              onClick={() => handleRoleSwitch("user")}
            >
              Học viên
            </button>
            <button
              className={roleSwitch === "instructor" ? "active" : ""}
              onClick={() => handleRoleSwitch("instructor")}
            >
              Giảng viên
            </button>
          </div>
        </div>

        {saved && (
          <div className="save-success">✓ Cập nhật thông tin thành công!</div>
        )}

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
                value={formData.email}
                onChange={changeHandler}
                disabled={!editing}
                type="email"
                placeholder="Nhập email"
              />
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

          {/* Instructor only section */}
          {roleSwitch === "instructor" && (
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
                  <span className="stat-number">{user.courses_count}</span>
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

          {/* Buttons */}
          {editing && (
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
              >
                Hủy
              </button>
              <button type="submit" className="btn-save">
                Lưu thay đổi
              </button>
            </div>
          )}
        </form>

        {/* Change password */}
        <div className="form-section password-section">
          <h3>Bảo mật</h3>
          <button className="btn-change-password">Đổi mật khẩu</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

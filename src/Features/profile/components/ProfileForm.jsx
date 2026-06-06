import React from "react";
import InstructorSection from "./InstructorSection";

const ProfileForm = ({
  authUser,
  formData,
  editing,
  loading,
  changeHandler,
  handleSave,
  handleCancel,
}) => {
  return (
    <form className="profile-form" onSubmit={handleSave}>
      <div className="form-section">
        <h3>Thông tin cá nhân</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Họ và tên</label>
            {/* Đổi name thành fullName */}
            <input
              name="fullName"
              value={formData.fullName}
              onChange={changeHandler}
              disabled={!editing}
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={changeHandler}
              disabled={!editing}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input value={authUser.email} disabled />
        </div>

        <div className="form-group">
          <label>Giới thiệu bản thân</label>
          <textarea
            rows="3"
            name="bio"
            value={formData.bio}
            onChange={changeHandler}
            disabled={!editing}
          />
        </div>
      </div>

      {/* Hiển thị form cho Giảng viên */}
      <InstructorSection
        authUser={authUser}
        formData={formData}
        changeHandler={changeHandler}
        editing={editing}
      />

      {editing && (
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={handleCancel}>
            Hủy
          </button>

          <button type="submit" className="btn-save" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      )}
    </form>
  );
};

export default ProfileForm;

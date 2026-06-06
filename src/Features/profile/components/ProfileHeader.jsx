const ProfileHeader = ({ authUser, editing, setEditing }) => {
  // SỬA Ở ĐÂY: Dùng isInstructor thay vì role === 'instructor'
  const isInstructor = authUser?.isInstructor;

  return (
    <div className="profile-header">
      <div className="profile-avatar">
        <div className="avatar-circle">
          {/* SỬA TÊN BIẾN: fullName thay vì username */}
          {authUser?.fullName?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>

      <div className="profile-header-info">
        <h2>{authUser?.fullName}</h2>
        <span
          className={`role-badge ${isInstructor ? "role-instructor" : "role-user"}`}
        >
          {isInstructor ? "Giảng viên" : "Học viên"}
        </span>
        <p>{authUser?.email}</p>
      </div>

      {!editing && (
        <button
          className="btn-edit"
          type="button"
          onClick={() => setEditing(true)}
        >
          Chỉnh sửa
        </button>
      )}
    </div>
  );
};

export default ProfileHeader;

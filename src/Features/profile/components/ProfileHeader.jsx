const ProfileHeader = ({ authUser, editing, setEditing }) => {
  const isInstructor = authUser?.role === "instructor";

  return (
    <div className="profile-header">
      <div className="profile-avatar">
        <div className="avatar-circle">
          {authUser?.username?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>

      <div className="profile-header-info">
        <h2>{authUser?.username}</h2>

        <span className={`role-badge role-${authUser?.role}`}>
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

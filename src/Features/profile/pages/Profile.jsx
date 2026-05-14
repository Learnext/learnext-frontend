import "../styles/Profile.css";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { useAuth } from "../../auth/context/AuthContext";

import ProfileHeader from "../components/ProfileHeader";
import ProfileForm from "../components/ProfileForm";

import { useProfile } from "../hooks/useProfile";

const Profile = () => {
  const { user: authUser, login } = useAuth();
  const navigate = useNavigate();

  const profile = useProfile(authUser, login);

  useEffect(() => {
    if (!authUser) navigate("/login");
  }, [authUser, navigate]);

  if (!authUser) return null;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <ProfileHeader
          authUser={authUser}
          editing={profile.editing}
          setEditing={profile.setEditing}
        />

        {profile.saved && (
          <div className="save-success">✓ Cập nhật thành công</div>
        )}

        {profile.error && <div className="save-error">{profile.error}</div>}

        <ProfileForm authUser={authUser} {...profile} />
      </div>
    </div>
  );
};

export default Profile;

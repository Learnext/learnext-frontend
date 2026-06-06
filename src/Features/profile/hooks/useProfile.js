import { useState, useEffect } from "react";
import { fetchProfile, updateProfile } from "../services/profileService";

export const useProfile = (authUser, authLogin) => {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Chuẩn hóa state theo đúng DTO
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    bio: "",
    expertise: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchProfile();
        if (profile) {
          setFormData({
            fullName: profile.fullName || authUser?.fullName || "",
            phone: profile.phone || "",
            bio: profile.bio || "",
            expertise: profile.expertise || authUser?.expertise || "",
          });
        }
      } catch {
        if (authUser) {
          setFormData({
            fullName: authUser.fullName || "",
            phone: authUser.phone || "",
            bio: authUser.bio || "",
            expertise: authUser.expertise || "",
          });
        }
      }
    };

    if (authUser) loadProfile();
  }, [authUser]);

  const changeHandler = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await updateProfile(formData, authUser);

      if (!data.success) {
        setError(data.message || "Lưu thất bại");
        return;
      }

      authLogin(localStorage.getItem("auth-token"), data.user);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: authUser?.fullName || "",
      phone: authUser?.phone || "",
      bio: authUser?.bio || "",
      expertise: authUser?.expertise || "",
    });
    setEditing(false);
    setError("");
  };

  return {
    editing,
    setEditing,
    saved,
    loading,
    error,
    formData,
    changeHandler,
    handleSave,
    handleCancel,
  };
};

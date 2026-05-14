import { useState, useEffect } from "react";
import { updateProfile } from "../services/profileService";

export const useProfile = (authUser, authLogin) => {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    bio: "",
    expertise: "",
  });

  useEffect(() => {
    if (authUser) {
      setFormData({
        username: authUser.username || "",
        phone: authUser.phone || "",
        bio: authUser.bio || "",
        expertise: authUser.expertise || "",
      });
    }
  }, [authUser]);

  const changeHandler = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

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
      username: authUser?.username || "",
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

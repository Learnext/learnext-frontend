import { useState } from "react";
import { updateProfile } from "../services/profileService";

export const useProfile = (authUser, authLogin) => {
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

  const changeHandler = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await updateProfile(formData, authUser);

      if (!data.success) {
        setError(data.message);
        return;
      }

      authLogin(localStorage.getItem("auth-token"), data.user);

      setEditing(false);
      setSaved(true);

      setTimeout(() => setSaved(false), 3000);
    } catch {
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
